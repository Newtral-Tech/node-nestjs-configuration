/**
 * Convert the given string into the injection token of the configuration
 * @param configuration The configuration key to inject
 */
export function getConfigurationInjectionToken(configuration: string): symbol {
  return Symbol.for(`configuration.${configuration}`);
}
