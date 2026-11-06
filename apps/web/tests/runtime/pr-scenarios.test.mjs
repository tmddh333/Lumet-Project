// Trusted repository fixtures only, executed by maintainers, never in the app.
import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadFixtures } from "../../scripts/validate-fixtures.mjs";

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 15000,
    maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function java(source, capture) {
  const dir = mkdtempSync(join(tmpdir(), "lumet-review-java-"));
  try {
    writeFileSync(
      join(dir, "Verify.java"),
      `import java.util.*; class Verify { public static void main(String[] args) { ${source}\n${capture} } }`,
    );
    run("javac", ["--release", "17", join(dir, "Verify.java")]);
    return run("java", ["-cp", dir, "Verify"]).split("\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const racePrelude = `const pendingRequests = new Map();
function fetchResults(query) { return new Promise((resolve) => pendingRequests.set(query, resolve)); }
function resolveRequest(query, value) { const resolve = pendingRequests.get(query); pendingRequests.delete(query); resolve(value); }`;
const formatJs = `const formatValue = (value) => JSON.stringify(value).replaceAll(',', ', ').replaceAll(':', ': ');`;
function observe(scenario, source, line = Infinity) {
  switch (scenario.scenarioId) {
    case "java-coupon-equality": {
      const names = ["input", "coupon", "accepted"].slice(0, line);
      const values = java(
        source,
        names.map((name) => `System.out.println(${name});`).join("\n"),
      );
      return Object.fromEntries(
        names.map((name, i) => [
          name,
          name === "accepted" ? values[i] : JSON.stringify(values[i]),
        ]),
      );
    }
    case "java-member-list": {
      const values = java(
        `List<String> names = null; String exception = "없음"; try { ${source.replace("List<String> names =", "names =")} } catch (RuntimeException error) { exception = error.getClass().getSimpleName(); }`,
        "System.out.println(names); System.out.println(exception);",
      );
      return { names: values[0], exception: values[1] };
    }
    case "javascript-price-sort": {
      const names = ["prices", "sorted", "cheapest"].slice(0, line);
      return JSON.parse(
        run(process.execPath, [
          "--input-type=module",
          "-e",
          `${source}\n${formatJs}\nconsole.log(JSON.stringify(Object.fromEntries(Object.entries({${names.join(",")}}).map(([key,value]) => [key, formatValue(value)]))));`,
        ]),
      );
    }
    case "javascript-search-race":
      return JSON.parse(
        run(process.execPath, [
          "--input-type=module",
          "-e",
          `${racePrelude}\n${source}\n${formatJs}\nconsole.log(JSON.stringify({results:formatValue(results),pending:formatValue([...pendingRequests.keys()])}));`,
        ]),
      );
    case "python-default-tags": {
      const capture = `import json\nresult = {"defaultTags": json.dumps(add_tag.__defaults__[0])}\nfor name in ["first", "second"]:\n    if name in globals():\n        result[name] = json.dumps(globals()[name])\nprint(json.dumps(result))`;
      return JSON.parse(run("python3", ["-c", `${source}\n${capture}`]));
    }
    case "python-draft-copy": {
      const capture = `import json\nresult = {}\nfor name in ["original", "draft"]:\n    if name in globals():\n        result[name] = json.dumps(globals()[name])\nprint(json.dumps(result))`;
      return JSON.parse(run("python3", ["-c", `${source}\n${capture}`]));
    }
    default:
      throw new Error(`Missing PR verifier: ${scenario.scenarioId}`);
  }
}
const fixtures = loadFixtures().filter(
  (scenario) => scenario.review.mode === "pull_request",
);
for (const scenario of fixtures) {
  for (const step of scenario.steps.slice(1)) {
    test(`${scenario.scenarioId}: statement/event boundary ${step.line}`, () => {
      const source = scenario.code.split("\n").slice(0, step.line).join("\n");
      assert.deepEqual(observe(scenario, source, step.line), step.state);
    });
  }
  test(`${scenario.scenarioId}: correction satisfies the regression requirement`, () => {
    const actual = observe(scenario, scenario.review.fix.code);
    switch (scenario.scenarioId) {
      case "java-coupon-equality":
        assert.equal(actual.accepted, "true");
        break;
      case "java-member-list":
        assert.deepEqual(actual, {
          names: "[Grace, Lin, Kai]",
          exception: "없음",
        });
        break;
      case "javascript-price-sort":
        assert.deepEqual(actual, {
          prices: "[30, 10, 20]",
          sorted: "[10, 20, 30]",
          cheapest: "10",
        });
        break;
      case "javascript-search-race":
        assert.deepEqual(actual, { results: '["react"]', pending: "[]" });
        break;
      case "python-default-tags":
        assert.deepEqual(actual, {
          defaultTags: "null",
          first: '["work"]',
          second: '["home"]',
        });
        break;
      case "python-draft-copy":
        assert.deepEqual(actual, {
          original: '{"tags": ["work"]}',
          draft: '{"tags": ["work", "urgent"]}',
        });
        break;
    }
  });
}
const find = (id) => fixtures.find((scenario) => scenario.scenarioId === id);
test("coupon correction also rejects different text", () => {
  const scenario = find("java-coupon-equality");
  assert.equal(
    observe(
      scenario,
      scenario.review.fix.code.replace(
        'new String("SAVE10")',
        'new String("OTHER")',
      ),
    ).accepted,
    "false",
  );
});
test("request correction works with either completion order and a third request", () => {
  const scenario = find("javascript-search-race");
  const reversed = scenario.review.fix.code.replace(
    'resolveRequest("re", ["react"]);\nawait second;\nresolveRequest("r", ["ruby"]);\nawait first;',
    'resolveRequest("r", ["ruby"]);\nawait first;\nresolveRequest("re", ["react"]);\nawait second;',
  );
  assert.equal(observe(scenario, reversed).results, '["react"]');
  const third = scenario.review.fix.code.replace(
    'resolveRequest("re", ["react"]);',
    'const third = search("rea");\nresolveRequest("rea", ["read"]);\nawait third;\nresolveRequest("re", ["react"]);',
  );
  assert.equal(observe(scenario, third).results, '["read"]');
});
test("default correction keeps explicit empty-list identity and independent calls", () => {
  const source = find("python-default-tags").review.fix.code;
  const assertions =
    '\nassert first is not second\nprovided = []\nresult = add_tag("x", provided)\nassert result is provided\nassert provided == ["x"]\nprint("ok")';
  assert.equal(run("python3", ["-c", source + assertions]), "ok");
});
test("draft correction isolates nested lists rather than only the outer dict", () => {
  const source = find("python-draft-copy").review.fix.code;
  assert.equal(
    run("python3", [
      "-c",
      source +
        '\nassert original is not draft\nassert original["tags"] is not draft["tags"]\nprint("ok")',
    ]),
    "ok",
  );
});
