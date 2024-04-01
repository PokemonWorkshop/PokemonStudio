import { InputHTMLAttributes } from 'react';
import { z } from 'zod';

export const inputAttrs = (singleAttributeValidator: z.ZodFirstPartySchemaTypes): InputHTMLAttributes<HTMLInputElement> => {
  if (singleAttributeValidator instanceof z.ZodBranded) {
    return inputAttrs(singleAttributeValidator.unwrap());
  } else if (singleAttributeValidator instanceof z.ZodOptional) {
    const { required, ...attrs } = inputAttrs(singleAttributeValidator.unwrap());
    return attrs;
  } else if (singleAttributeValidator instanceof z.ZodNullable) {
    const { required, ...attrs } = inputAttrs(singleAttributeValidator.unwrap());
    return {
      ['data-input-empty-type' as 'type']: 'null',
      ...attrs,
    };
  } else if (singleAttributeValidator instanceof z.ZodDefault) {
    const { required, ...attrs } = inputAttrs(singleAttributeValidator.removeDefault());
    return {
      ['data-input-empty-default-value' as 'type']: singleAttributeValidator._def.defaultValue(),
      ...attrs,
    };
  }

  const attributes: InputHTMLAttributes<HTMLInputElement> = { required: true, type: 'text' };
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
