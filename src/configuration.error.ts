import { ErrorObject } from 'ajv';

export class ConfigurationError extends Error {
  readonly name = this.constructor.name;

  get message(): string {
    const errorMessage = this.errors
      .map(({ message, dataPath, params }) => {
        if (dataPath.startsWith('.')) {
          dataPath = dataPath.slice(1);
        }

        if (dataPath) {
          dataPath = `${dataPath} `;
        }

        return `  - ${dataPath}${message} | ${paramsToString(params)}`.trim();
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
