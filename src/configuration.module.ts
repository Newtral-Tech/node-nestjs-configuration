import { DynamicModule, Inject } from '@nestjs/common';
import Ajv from 'ajv';
import { JSONSchema7 } from 'json-schema';
import { CONFIGURATION } from './configuration.keys';
import { getConfigurationInjectionToken } from './get-configuration-injection-token';
import { JsonSchemaToJs } from './json-schema-to-js.type';
import { loadConfiguration } from './load-configuration';

const defaultAjv = new Ajv({ $data: true, coerceTypes: true, useDefaults: true });

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

    return {
      InjectConfiguration: (configurationKey?: keyof Configuration<T>): ParameterDecorator => {
        if (configurationKey) {
          return Inject(getConfigurationInjectionToken(configurationKey as string));
        }

        return Inject(CONFIGURATION);
      },
      configurationModule: {
        module: ConfigurationModule,
        providers: [configurationProvider, ...providers],
        exports: [CONFIGURATION, ...providers.map(provider => provider.provide)]
      }
    };
  }
}

/** Decorator that inject the whole configuration object or a single value depending on how it's used */
export interface InjectConfigurationDecorator<T extends JSONSchema7> {
  /**
   * Inject a single configuration value that matches the given key.
   * The type for the injected value is `Configuration<schema>[configurationKey]`
   * @param configurationKey - The property name of the configuration to inject.
   */
  (configurationKey: keyof Configuration<T>): ParameterDecorator;

  /** Inject the whole configuration object. The type for this object is `Configuration<schema>` */
  (): ParameterDecorator;
}

export interface ConfigurationModuleResult<T extends JSONSchema7> {
  InjectConfiguration: InjectConfigurationDecorator<T>;
  configurationModule: DynamicModule;
}

/** Map a JSON schema into a valid JS type representation. It's currently very limited but usable enough */
export type Configuration<T extends JSONSchema7> = JsonSchemaToJs<T>;
