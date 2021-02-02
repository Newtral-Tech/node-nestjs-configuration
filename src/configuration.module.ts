import { DynamicModule, Inject } from '@nestjs/common';
import Ajv from 'ajv';
import ajvFormats from 'ajv-formats';
import { JSONSchema7 } from 'json-schema';
import { CONFIGURATION } from './configuration.keys';
import { getConfigurationInjectionToken } from './get-configuration-injection-token';
import { JsonSchemaToJs } from './json-schema-to-js.type';
import { loadConfiguration } from './load-configuration';

const defaultAjv = new Ajv({ $data: true, coerceTypes: true, useDefaults: true, allErrors: true });
ajvFormats(defaultAjv);

export class ConfigurationModule {
  /**
   * Inject the configuration module using the given schema to validate the environment variables.
   * Although the schema could be any valid json schema only object schemas would pass the validation because the values used to validated
   * are extracted from process.env
   */
  static forEnvironment<T extends JSONSchema7>(schema: T): ConfigurationModuleResult<T> {
    // `useFactory()` is used to prevent configuration errors to be thrown before the module is initialized
    const configurationProvider = {
      provide: CONFIGURATION,
      useFactory: () => loadConfiguration(schema, defaultAjv)
    };

    const providers = Object.keys(schema?.properties ?? {}).map(key => ({
      provide: getConfigurationInjectionToken(key),
      useFactory: (configurationValues: Configuration<T>) => (configurationValues as any)?.[key],
      inject: [CONFIGURATION]
    }));

    const tokens: ConfigurationInjectionTokens<T> = Object.keys(schema?.properties ?? {}).reduce((result, key) => {
      result[key] = getConfigurationInjectionToken(key);

      return result;
    }, {} as any);

    return {
      InjectConfiguration: (configurationKey?: keyof Configuration<T>) => {
        if (configurationKey) {
          return Inject(getConfigurationInjectionToken(configurationKey as string));
        }

        return Inject(CONFIGURATION);
      },
      configurationModule: {
        module: ConfigurationModule,
        providers: [configurationProvider, ...providers],
        exports: [CONFIGURATION, ...providers.map(provider => provider.provide)]
      },
      tokens
    };
  }
}

export interface ConfigurationModuleResult<T extends JSONSchema7> {
  /** Configuration module. Should be imported by other modules */
  configurationModule: DynamicModule;
  /** Configuration injection tokens. Useful for dynamically getting a configuration value */
  tokens: ConfigurationInjectionTokens<T>;

  /**
   * Inject a single configuration value that matches the given key.
   * The type for the injected value is `Configuration<schema>[configurationKey]`
   * @param configurationKey - The property name of the configuration to inject.
   */
  InjectConfiguration(
    configurationKey: keyof Configuration<T>
  ): (target: Object, propertyKey: string | symbol, parameterIndex?: number) => void;

  /** Inject the whole configuration object. The type for this object is `Configuration<schema>` */
  InjectConfiguration(): (target: Object, propertyKey: string | symbol, parameterIndex?: number) => void;
}

/** Map a JSON schema into a valid JS type representation. It's currently very limited but usable enough */
export type Configuration<T extends JSONSchema7> = JsonSchemaToJs<T>;

export type ConfigurationInjectionTokens<T extends JSONSchema7> = Record<keyof Configuration<T>, symbol>;
