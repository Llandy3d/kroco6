import type { Environment } from "$lib/backend-client";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as estreePlugin from "prettier/plugins/estree";
import type { Scenario, Step, Test } from "../../types";
import { exhaustive } from "../../utils/typescript";

type Substitution = [name: string, value: string];

function sanitizeName(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.replaceAll(/[^_a-zA-Z0-9]/g, ""))
    .filter((part) => part !== "")
    .map((part, index) =>
      index > 0 ? part[0]?.toUpperCase() + part.slice(1) : part[0]?.toLowerCase() + part.slice(1),
    );

  const sanitizied = parts.join("");

  if (!/^[_a-z]/i.test(sanitizied)) {
    return `_${sanitizied}`;
  }

  return sanitizied;
}

function substitute(target: string, substitutions: Substitution[]) {
  return substitutions.reduce((acc, [name, value]) => acc.replaceAll(`{{${name}}}`, value), target);
}

function emitStep(step: Step, substitutions: Substitution[]): string {
  switch (step.type) {
    case "http-request":
      return `http.${step.method.toLowerCase()}(${substitute(JSON.stringify(step.url), substitutions)});`;

    case "group":
      return `
        group("${substitute(step.name, substitutions)}", () => {
          ${step.steps.map((step) => emitStep(step, substitutions)).join("\n\n")}
        }); 
      `;

    case "check":
      return ` 
        response = ${emitStep(step.target, substitutions)}

			  check(response, {
					${step.checks
            .map((check) => {
              switch (check.type) {
                case "has-status":
                  return `status: (r) => r.status === ${check.status}`;

                case "body-contains":
                  return `body: (r) => r.body.includes(${JSON.stringify(substitute(check.value, substitutions))})`;
              }
            })
            .join(",")},
				})
			`;

    case "sleep":
      return `sleep(${step.seconds});`;

    default:
      return exhaustive(step);
  }
}

function emitExecutors(scenario: Scenario) {
  const fn = sanitizeName(scenario.name);

  const executors = scenario.executors.map((executor) => {
    switch (executor.type) {
      case "constant-vus":
        return `
          { 
            "executor": "constant-vus", 
            "vus": ${executor.vus}, 
            "duration": "${executor.duration}",
            "exec": "${fn}",
          }
        `;

      case "ramping-vus":
        return `
          { 
            "executor": "ramping-vus",
            "stages": [${executor.stages
              .map(
                (stage) => `{ 
              "target": ${stage.target}, 
              "duration": "${stage.duration}" 
            }`,
              )
              .join(", ")}], 
            "duration": "${executor.duration}" },
            "exec": "${fn}",
        `;

      default:
        exhaustive(executor);
    }
  });

  if (executors.length === 0) {
    return "";
  }

  return `"${fn}": ${executors.join(",\n")},`;
}

function emitScenario(scenario: Scenario, substitutions: Substitution[]) {
  const scenarioName = sanitizeName(substitute(scenario.name, substitutions));

  return `  
    export function ${scenarioName}() {
			let response = null;

      ${scenario.steps.map((step) => emitStep(step, substitutions)).join("\n\n")}
    }
  `;
}

function emitScript(env: Environment, test: Test) {
  const substitutions = Object.entries(env.variables);
  const scenarioOptions = test.scenarios.flatMap(emitExecutors);

  const scenarios = test.scenarios.map((scenario) => emitScenario(scenario, substitutions));

  const code = `
    import http from 'k6/http';
    import { group, check, sleep } from 'k6';

    export const options = {
      scenarios: { 
        ${scenarioOptions.join("\n")}
      },
    };

    ${scenarios.join("\n\n")} 
  `;

  return prettier.format(code, {
    parser: "babel",
    plugins: [babelParser, estreePlugin],
  });
}

export { emitScript };
