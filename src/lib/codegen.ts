import { exhaustive } from '../utils/typescript';
import type { Scenario, Step, Test } from './types';
import * as prettier from 'prettier';
import * as babelParser from 'prettier/parser-babel';
import * as estreePlugin from 'prettier/plugins/estree';

function sanitizeName(name: string) {
	const parts = name
		.split(' ')
		.map((part) => part.replaceAll(/[^_a-zA-Z0-9]/g, ''))
		.filter((part) => part !== '')
		.map((part, index) =>
			index > 0 ? part[0]?.toUpperCase() + part.slice(1) : part[0]?.toLowerCase() + part.slice(1)
		);

	const sanitizied = parts.join('');

	if (!/^[_a-z]/i.test(sanitizied)) {
		return `_${sanitizied}`;
	}

	return sanitizied;
}

function emitStep(step: Step): string {
	switch (step.type) {
		case 'http-request':
			return `http.${step.method.toLowerCase()}(${JSON.stringify(step.url)});`;

		case 'group':
			return `
        group("${step.name}", () => {
          ${step.steps.map(emitStep).join('\n\n')}
        });
      `;

		case 'check':
			return `
        response = ${emitStep(step.target)}

			  check(response, {
					${step.checks
						.map((check) => {
							switch (check.type) {
								case 'has-status':
									return `status: (r) => r.status === ${check.status}`;

								case 'body-contains':
									return `body: (r) => r.body.includes(${JSON.stringify(check.value)})`;
							}
						})
						.join(',')},
				})
			`;

		default:
			return exhaustive(step);
	}
}

function emitExecutors(scenario: Scenario) {
	const fn = sanitizeName(scenario.name);

	const executors = scenario.executors.map((executor) => {
		switch (executor.type) {
			case 'constant-vus':
				return `
          { 
            "executor": "constant-vus", 
            "vus": ${executor.vus}, 
            "duration": "${executor.duration}",
            "exec": "${fn}",
          }
        `;

			case 'ramping-vus':
				return `
          { 
            "executor": "ramping-vus",
            "stages": [${executor.stages
							.map(
								(stage) => `{ 
              "target": ${stage.target}, 
              "duration": "${stage.duration}" 
            }`
							)
							.join(', ')}], 
            "duration": "${executor.duration}" },
            "exec": "${fn}",
        `;

			default:
				exhaustive(executor);
		}
	});

	if (executors.length === 0) {
		return '';
	}

	return `"${scenario.name}": ${executors.join(',\n')},`;
}

function emitScenario(scenario: Scenario) {
	return ` 
    export function ${sanitizeName(scenario.name)}() {
			let response = null;

      ${scenario.steps.map(emitStep).join('\n\n')}
    }
  `;
}

function emitScript(test: Test) {
	const scenarioOptions = test.scenarios.flatMap(emitExecutors);

	const scenarios = test.scenarios.map(emitScenario);

	const code = `
    import http from 'k6/http';
    import { group, check } from 'k6';

    export const options = {
      scenarios: { 
        ${scenarioOptions.join('\n')}
      },
    };

    ${scenarios.join('\n\n')} 
  `;

	return prettier.format(code, {
		parser: 'babel',
		plugins: [babelParser, estreePlugin]
	});
}

export { emitScript };
