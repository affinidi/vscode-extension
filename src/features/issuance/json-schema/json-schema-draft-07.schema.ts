import { JsonSchema } from './json-schema.dto'

export const DRAFT_07_URL = new URL('http://json-schema.org/draft-07/schema')

export const DRAFT_07_SCHEMA: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://json-schema.org/draft-07/schema#',
  title: 'Core schema meta-schema',
  definitions: {
    schemaArray: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#' },
    },
    nonNegativeInteger: {
      type: 'integer',
      minimum: 0,
    },
    nonNegativeIntegerDefault0: {
      // @ts-ignore
      allOf: [{ $ref: '#/definitions/nonNegativeInteger' }, { default: 0 }],
    },
    simpleTypes: {
      enum: ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'],
    },
    stringArray: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
      // @ts-ignore
      default: [],
    },
  },
  type: ['object', 'boolean'],
  properties: {
    $id: {
      type: 'string',
      format: 'uri-reference',
    },
    $schema: {
      type: 'string',
      format: 'uri',
    },
    $ref: {
      type: 'string',
      format: 'uri-reference',
    },
    $comment: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    // @ts-ignore
    default: true,
    readOnly: {
      type: 'boolean',
      // @ts-ignore
      default: false,
    },
    writeOnly: {
      type: 'boolean',
      // @ts-ignore
      default: false,
    },
    examples: {
      type: 'array',
      // @ts-ignore
      items: true,
    },
    multipleOf: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    maximum: {
      type: 'number',
    },
    exclusiveMaximum: {
      type: 'number',
    },
    minimum: {
      type: 'number',
    },
    exclusiveMinimum: {
      type: 'number',
    },
    maxLength: { $ref: '#/definitions/nonNegativeInteger' },
    minLength: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
    pattern: {
      type: 'string',
      format: 'regex',
    },
    additionalItems: { $ref: '#' },
    items: {
      anyOf: [{ $ref: '#' }, { $ref: '#/definitions/schemaArray' }],
      // @ts-ignore
      default: true,
    },
    maxItems: { $ref: '#/definitions/nonNegativeInteger' },
    minItems: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
    uniqueItems: {
      type: 'boolean',
      // @ts-ignore
      default: false,
    },
    contains: { $ref: '#' },
    maxProperties: { $ref: '#/definitions/nonNegativeInteger' },
    minProperties: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
    required: { $ref: '#/definitions/stringArray' },
    additionalProperties: { $ref: '#' },
    definitions: {
      type: 'object',
      additionalProperties: { $ref: '#' },
      // @ts-ignore
      default: {},
    },
    properties: {
      type: 'object',
      additionalProperties: { $ref: '#' },
      // @ts-ignore
      default: {},
    },
    patternProperties: {
      type: 'object',
      additionalProperties: { $ref: '#' },
      // @ts-ignore
      propertyNames: { format: 'regex' },
      default: {},
    },
    dependencies: {
      type: 'object',
      additionalProperties: {
        anyOf: [{ $ref: '#' }, { $ref: '#/definitions/stringArray' }],
      },
    },
    propertyNames: { $ref: '#' },
    // @ts-ignore
    const: true,
    enum: {
      type: 'array',
      // @ts-ignore
      items: true,
      minItems: 1,
      uniqueItems: true,
    },
    type: {
      anyOf: [
        { $ref: '#/definitions/simpleTypes' },
        {
          type: 'array',
          items: { $ref: '#/definitions/simpleTypes' },
          minItems: 1,
          uniqueItems: true,
        },
      ],
    },
    format: { type: 'string' },
    contentMediaType: { type: 'string' },
    contentEncoding: { type: 'string' },
    if: { $ref: '#' },
    then: { $ref: '#' },
    else: { $ref: '#' },
    allOf: { $ref: '#/definitions/schemaArray' },
    anyOf: { $ref: '#/definitions/schemaArray' },
    oneOf: { $ref: '#/definitions/schemaArray' },
    not: { $ref: '#' },
  },
  default: true,
}
