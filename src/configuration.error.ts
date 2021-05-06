import { ErrorObject } from 'ajv';

export class ConfigurationError extends Error {
  readonly name = this.constructor.name;

  get message(): string {
    const errorMessage = this.errors
      .map(({ message, instancePath, params }) => {
        if (instancePath.startsWith('.')) {
          instancePath = instancePath.slice(1);
        }

        if (instancePath) {
          instancePath = `${instancePath} `;
        }

        return `  - ${instancePath}${message} | ${paramsToString(params)}`.trim();
      })
      .join('\n');

    return `Invalid configuration found:\n\n${errorMessage}\n`;
  }

  constructor(readonly errors: ErrorObject[]) {
    super();
  }
}

const paramsToString = (params: object): string => {
  return Object.entries(params)
    .map(pair => pair.join('='))
    .join(', ');
};
