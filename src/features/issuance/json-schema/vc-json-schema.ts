import { Validator, PreValidatePropertyFunction } from 'jsonschema'
import { JsonSchema, ValidationResult, VcJsonSchemaType } from './json-schema.dto'

type ValidateCredentialSubjectOptions = {
  // !important! may mutate the input credential subject
  // try to cast simple types like number, integer and boolean from string
  withTypeCasting: boolean
}

function tryParseNumberFromString(str: string): string | number {
  const parsed = Number(str)

  return Number.isFinite(parsed) ? parsed : str
}

function tryParseIntegerFromString(str: string): string | number {
  const parsed = Number(str)

  return Number.isInteger(parsed) ? parsed : str
}

function tryParseBooleanFromString(str: string): string | boolean {
  switch (str?.toLowerCase()?.trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true

    case 'false':
    case 'no':
    case '0':
      return false

    default:
      return str
  }
}

const createPreValidateProperty = (validator: Validator): PreValidatePropertyFunction =>
  function preValidateProperty(object, key, schema, options, ctx) {
    const value = object[key]
    if (typeof value === 'undefined') return

    // Test if the schema declares a type, but the type keyword fails validation
    if (
      schema.type &&
      validator.attributes.type.call(
        validator,
        value,
        schema,
        options,
        ctx.makeChild(schema, key),
      ) &&
      typeof value === 'string'
    ) {
      if (schema.type === 'number') {
        // eslint-disable-next-line no-param-reassign
        object[key] = tryParseNumberFromString(value)
      } else if (schema.type === 'integer') {
        // eslint-disable-next-line no-param-reassign
        object[key] = tryParseIntegerFromString(value)
      } else if (schema.type === 'boolean') {
        // eslint-disable-next-line no-param-reassign
        object[key] = tryParseBooleanFromString(value)
      }
    }
  }

export class VcJsonSchema {
  constructor(private readonly schema: VcJsonSchemaType) {}

  validateCredentialSubject(
    credentialSubject: unknown,
    options: ValidateCredentialSubjectOptions = { withTypeCasting: false },
  ): ValidationResult {
    const validator = new Validator()

    const validationResult = validator.validate(
      credentialSubject,
      this.getCredentialSubjectSchema(),
      {
        preValidateProperty: options.withTypeCasting
          ? createPreValidateProperty(validator)
          : undefined,
      },
    )

    if (validationResult.valid) {
      return { valid: true, instance: validationResult.instance }
    }

    return {
      valid: false,
      errors: validationResult.errors.map(({ name, path, message }) => ({
        field: path.join('.'),
        name,
        message,
      })),
    }
  }

  getCredentialSubjectSchema(): JsonSchema {
    return this.schema.properties.credentialSubject
  }

  byteSize(): number {
    return Buffer.byteLength(JSON.stringify(this.schema), 'utf8')
  }
}
