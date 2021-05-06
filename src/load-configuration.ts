import Ajv from 'ajv';
import dotenv from 'dotenv';
import { JSONSchema7 } from 'json-schema';
import { ConfigurationError } from './configuration.error';
import { Configuration } from './configuration.module';

let originalEnvironment: Record<string, string> | undefined;

/** Restore the process.env object as it's the same state it was before calling loadConfiguration */
export function restoreConfiguration(): void {
  if (originalEnvironment) {
    process.env = originalEnvironment;
    originalEnvironment = undefined;
  }
}

/**
 * Load and validate the configuration using environment variables and dotenv files
 * @private
 * @param schema - The schema to validate the configuration against. Although the schema could be any valid json schema only object schemas
 *                 would pass the validation because the values used to validated are extracted from process.env
 * @param ajv    - The ajv instance used to create the schema validator
 */
export function loadConfiguration<T extends JSONSchema7>(schema: T, ajv: Ajv): Configuration<T> {
  // Track the original environment
  originalEnvironment = originalEnvironment! ?? { ...process.env };

  process.env = originalEnvironment;

  const nodeEnv = process.env.NODE_ENV;
  const env = { ...process.env };

  if (nodeEnv) {
    // Load an specific `.env` file by environment
    // For example, when `NODE_ENV` is `test` will try to load  a `.env.test` file
    const environmentEnvFile = `.env.${nodeEnv}`;

    try {
      const envConfig = dotenv.config({ path: environmentEnvFile }).parsed ?? {};

      assignIfNotSet(env, envConfig);
    } catch (err) {
      if ((err as any).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  // Always load the `.env` file
  const envConfig = dotenv.config().parsed ?? {};

  assignIfNotSet(env, envConfig);

  const validator = ajv.compile(schema);

  validator(env);

  if (validator.errors?.length) {
    throw new ConfigurationError(validator.errors);
  }

  // Assign the generated env to the original process.env just in case some third party package is using it
  Object.assign(process.env, env);
  Object.assign(
    process.env,
    Object.entries(env).reduce((result, [key, val]) => {
      result[key] = String(val);

      return result;
    }, {} as Record<string, string>)
  );

  return env as Configuration<T>;
}

function assignIfNotSet(assignTo: Record<string, any>, assignments: Record<string, any>) {
  Object.entries(assignments)
    .filter(([key]) => !(key in assignTo))
    .forEach(([key, val]) => (assignTo[key] = val));
}
