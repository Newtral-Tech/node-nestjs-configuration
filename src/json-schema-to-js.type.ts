import { JSONSchema7 } from 'json-schema';

export type JsonSchemaToJs<T extends JSONSchema7> = T extends {
  type: 'string';
}
  ? string
  : T extends { type: 'number' } | { type: 'integer' }
    ? number
    : T extends { type: 'null' }
      ? null
      : T extends { type: 'boolean' }
        ? boolean
        : T extends { type: 'array'; items: JSONSchema7 }
          ? Array<JsonSchemaToJs<T['items']>>
          : T extends { type: 'object'; properties: Record<string, JSONSchema7> }
            ? { [K in keyof T['properties']]: JsonSchemaToJs<T['properties'][K]> }
            : T extends { oneOf: [JSONSchema7, JSONSchema7] }
              ? { [K in keyof T['oneOf']]: JsonSchemaToJs<T['oneOf'][any]> }[number]
              : unknown;
