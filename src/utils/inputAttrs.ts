import { InputHTMLAttributes } from 'react';
import { z } from 'zod';
import { isStringPositiveInteger } from './isStringPositiveInteger';

export const inputAttrsSingle = (
  singleAttributeValidator: z.ZodFirstPartySchemaTypes,
  name: string,
  defaults?: Record<string, unknown>
): InputHTMLAttributes<HTMLInputElement> => {
  if (singleAttributeValidator instanceof z.ZodBranded) {
    return inputAttrsSingle(singleAttributeValidator.unwrap(), name);
  } else if (singleAttributeValidator instanceof z.ZodOptional) {
    const { required, ...attrs } = inputAttrsSingle(singleAttributeValidator.unwrap(), name);
    return attrs;
  } else if (singleAttributeValidator instanceof z.ZodNullable) {
    const { required, ...attrs } = inputAttrsSingle(singleAttributeValidator.unwrap(), name);
    return {
      ['data-input-empty-type' as 'type']: 'null',
      ...attrs,
    };
  } else if (singleAttributeValidator instanceof z.ZodDefault) {
    const { required, ...attrs } = inputAttrsSingle(singleAttributeValidator.removeDefault(), name);
    return {
      ['data-input-empty-default-value' as 'type']: singleAttributeValidator._def.defaultValue(),
      ...attrs,
    };
  }

  const attributes: InputHTMLAttributes<HTMLInputElement> = { name, required: true, type: 'text', defaultValue: defaults?.[name] as string };
  if (singleAttributeValidator instanceof z.ZodString) {
    for (const check of singleAttributeValidator._def.checks) {
      switch (check.kind) {
        case 'min':
          attributes.minLength = check.value;
          break;
        case 'max':
          attributes.maxLength = check.value;
          break;
        case 'regex':
          attributes.pattern = check.regex.source;
          break;
        default:
          console.error('Unsupported string check:', check);
      }
    }
  } else if (singleAttributeValidator instanceof z.ZodNumber) {
    attributes.type = 'number';
    let minInclusive = true;
    let maxInclusive = true;
    for (const check of singleAttributeValidator._def.checks) {
      switch (check.kind) {
        case 'min':
          attributes.min = attributes.step !== undefined && !check.inclusive ? check.value + Number(attributes.step) : check.value;
          minInclusive = check.inclusive;
          break;
        case 'max':
          attributes.max = attributes.step !== undefined && !check.inclusive ? check.value - Number(attributes.step) : check.value;
          maxInclusive = check.inclusive;
          break;
        case 'int':
          attributes.step = 1;
          if (!maxInclusive && attributes.max !== undefined) attributes.max = Number(attributes.max) - 1;
          if (!minInclusive && attributes.min !== undefined) attributes.min = Number(attributes.min) + 1;
          break;
        case 'multipleOf':
          attributes.step = check.value;
          if (!maxInclusive && attributes.max !== undefined) attributes.max = Number(attributes.max) - check.value;
          if (!minInclusive && attributes.min !== undefined) attributes.min = Number(attributes.min) + check.value;
          break;
        case 'finite':
          break; // No idea how to handle that in HTML Inputs
        default:
          console.error('Unsupported number check:', check);
      }
    }
  }

  return attributes;
};

const getValidatorFromSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, schemaKey: string) => {
  const keys = schemaKey.split('.');
  let validator: z.ZodFirstPartySchemaTypes = schema;
  for (const key of keys) {
    if (isStringPositiveInteger(key)) {
      if (validator instanceof z.ZodArray) {
        const newValidator = validator._def.type as z.ZodFirstPartySchemaTypes;
        validator = newValidator;
      } else {
        throw new Error('Cannot have extract type from non array object with numeric key');
      }
    } else {
      if (validator instanceof z.ZodObject) {
        validator = validator.shape[key];
        if (!validator) throw new Error(`Failed to extract ${key} from schema (${schemaKey})`);
      } else {
        throw new Error('Expect simple Zod object with string key, consider giving a non-opaque schema with a schemaKey instead.');
      }
    }
  }

  return validator;
};

/**
 * Get the input attributes for a specific name & schema key
 * @param name name of the input (also of the schema key if key not given)
 * @param schemaKey key of the validator to use in schema
 */
export const inputAttrs = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, name: string, defaults?: Record<string, unknown>, schemaKey?: string) => {
  const validator = getValidatorFromSchema(schema, schemaKey ?? name);
  return inputAttrsSingle(validator, name, defaults);
};
