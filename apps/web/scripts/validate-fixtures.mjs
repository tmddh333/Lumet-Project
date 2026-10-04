import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv from "ajv";

const schema = JSON.parse(
  readFileSync(
    new URL("../src/domain/scenario.schema.json", import.meta.url),
    "utf8",
  ),
);
const validate = new Ajv({ allErrors: true }).compile(schema);

export function validateScenario(scenario) {
  if (!validate(scenario))
    throw new Error(`Scenario schema: ${JSON.stringify(validate.errors)}`);
  const fields = scenario.visualization.fields.map((field) => field.name);
  if (new Set(fields).size !== fields.length)
    throw new Error("Duplicate visualization field");
  const lines = scenario.code.split("\n").length;
  scenario.steps.forEach((step, index) => {
    if (step.id !== index)
      throw new Error("Step IDs must be contiguous from zero");
    if (step.line !== null && step.line > lines)
      throw new Error("Highlighted line is outside the code");
    if (Object.keys(step.state).some((name) => !fields.includes(name)))
      throw new Error("State has no matching visualization field");
  });
  if (
    scenario.steps[0].line !== null ||
    Object.keys(scenario.steps[0].state).length
  )
    throw new Error("Initial state must be empty");
  const choices = scenario.review.options.map((option) => option.id);
  if (
    new Set(choices).size !== choices.length ||
    !choices.includes(scenario.review.answer)
  )
    throw new Error("Invalid review answer/options");
  return scenario;
}

export function loadFixtures() {
  const directory = new URL("../src/content/", import.meta.url);
  const fixtures = readdirSync(directory)
    .filter((name) => name.endsWith(".json"))
    .map((name) =>
      validateScenario(
        JSON.parse(readFileSync(new URL(name, directory), "utf8")),
      ),
    );
  if (
    new Set(fixtures.map((fixture) => fixture.scenarioId)).size !==
    fixtures.length
  )
    throw new Error("Duplicate scenario ID");
  if (
    fixtures.some((fixture) => fixture.executionKind !== "curated_simulation")
  )
    throw new Error("M1 only accepts curated simulations");
  return fixtures;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    fileURLToPath(pathToFileURL(process.argv[1]))
) {
  console.log(
    `Validated ${loadFixtures().length} versioned scenario fixtures.`,
  );
}
