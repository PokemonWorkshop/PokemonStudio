import { DbSymbol } from '@modelEntities/dbSymbol';
import log from 'electron-log';
import { z } from 'zod';

export const deserializeZodData = <I extends z.ZodRawShape>(inputObjects: string[], validator: z.ZodObject<I>) => {
  return inputObjects
    .map((str) => {
      const res = validator.safeParse(JSON.parse(str));
      if (!res.success) log.error('Deserialization Error', str, res.error);
      return res;
    })
    .filter((res): res is z.SafeParseSuccess<z.infer<typeof validator>> => res.success)
    .map(({ data }) => data);
};

export const deserializeZodDiscriminatedData = <K extends string, Options extends z.ZodDiscriminatedUnionOption<K>[]>(
  inputObjects: string[],
  validator: z.ZodDiscriminatedUnion<K, Options>
) => {
  return inputObjects
    .map((str) => {
      const res = validator.safeParse(JSON.parse(str));
      if (!res.success) log.error('Deserialization Error', str, res.error);
      return res;
    })
    .filter((res): res is z.SafeParseSuccess<z.infer<typeof validator>> => res.success)
    .map(({ data }) => data);
};

export const zodDataToEntries = <I extends { dbSymbol: DbSymbol }>(input: I[]) => Object.fromEntries(input.map((d) => [d.dbSymbol, d]));

export const deserializeZodConfig = <I extends z.ZodRawShape>(inputObject: string, validator: z.ZodObject<I>) => {
  const validation = validator.safeParse(JSON.parse(inputObject));
  if (validation.success) return validation.data;

  throw new Error(`Failed to parse config ${JSON.stringify(validation.error)}`);
};
