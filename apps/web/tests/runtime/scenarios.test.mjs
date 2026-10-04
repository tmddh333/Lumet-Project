// Maintainer-authored fixtures only. This harness is never bundled or served.
// No shell, eval endpoint, submitted code, or runner exists in the application.
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
const fixtures = loadFixtures();
for (const scenario of fixtures) {
  for (const step of scenario.steps.slice(1)) {
    test(`${scenario.scenarioId}: runtime state after line ${step.line}`, () => {
      const prefix = scenario.code.split("\n").slice(0, step.line).join("\n");
      let actual;
      switch (scenario.scenarioId) {
        case "java-increment": {
          const directory = mkdtempSync(join(tmpdir(), "lumet-java-"));
          const names = ["a", "b", "c"].slice(0, step.line);
          try {
            const source = `class Verify { public static void main(String[] args) { ${prefix}\n${names.map((name) => `System.out.println(${name});`).join("\n")} } }`;
            writeFileSync(join(directory, "Verify.java"), source);
            run("javac", ["--release", "17", join(directory, "Verify.java")]);
            const output = run("java", ["-cp", directory, "Verify"]).split(
              "\n",
            );
            actual = Object.fromEntries(
              names.map((name, index) => [name, output[index]]),
            );
          } finally {
            rmSync(directory, { recursive: true, force: true });
          }
          break;
        }
        case "javascript-reference": {
          const names = step.line === 1 ? ["original"] : ["original", "alias"];
          const capture = `const identities = new Map(); const result = {}; for (const [name, value] of Object.entries({${names.join(",")}})) { if (!identities.has(value)) identities.set(value, identities.size + 1); result[name] = '@' + identities.get(value) + ' { count: ' + value.count + ' }'; } console.log(JSON.stringify(result));`;
          actual = JSON.parse(
            run(process.execPath, [
              "--input-type=module",
              "-e",
              `${prefix}\n${capture}`,
            ]),
          );
          break;
        }
        case "python-copy": {
          const names = step.line === 1 ? ["original"] : ["original", "copy"];
          const capture = `import json\nidentities = {}\nresult = {}\nfor name, value in [${names.map((name) => `('${name}', ${name})`).join(",")}]:\n    identities.setdefault(id(value), len(identities) + 1)\n    result[name] = '@' + str(identities[id(value)]) + ' ' + str(value)\nprint(json.dumps(result))`;
          actual = JSON.parse(run("python3", ["-c", `${prefix}\n${capture}`]));
          break;
        }
        default:
          throw new Error(
            `Missing independent runtime verifier: ${scenario.scenarioId}`,
          );
      }
      assert.deepEqual(actual, step.state);
    });
  }
}
