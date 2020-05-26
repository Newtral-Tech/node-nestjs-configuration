import { ErrorObject } from 'ajv';

export class ConfigurationError extends Error {
  readonly name = this.constructor.name;

  constructor(readonly errors: ErrorObject[]) {
    super();
  }

  get message(): string {
    const errorMessage = this.errors
      .map(({ message, dataPath }) => {
        if (dataPath.startsWith('.')) {
          dataPath = dataPath.slice(1);
        }

        if (dataPath) {
          dataPath = `${dataPath} `;
        }

        return `  - ${dataPath}${message}`;
      })
      .join('\n');

    return `Invalid configuration found:\n\n${errorMessage}\n`;
  }
}
