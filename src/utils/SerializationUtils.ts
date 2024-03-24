import { DbSymbol } from '@modelEntities/dbSymbol';
import { z } from 'zod';
import { parseJSON } from './json/parse';
import { FilenameWithData } from '@src/backendTasks/readProjectData';

export const deserializeZodData = <I extends z.ZodRawShape>(inputObjects: FilenameWithData[], validator: z.ZodObject<I>) => {
  const integrityFailureCount = { count: 0 };
  const input = inputObjects
    .map((str) => {
      const res = validator.safeParse(parseJSON(str.data, str.filename));
      if (!res.success) {
        window.api.log.error('Deserialization Error', str, res.error);
        integrityFailureCount.count++;
      }
      return res;
    })
    .filter((res): res is z.SafeParseSuccess<z.infer<typeof validator>> => res.success)
    .map(({ data }) => data);
  return {
    input,
    integrityFailureCount,
  };
};

export const deserializeZodDiscriminatedData = <K extends string, Options extends z.ZodDiscriminatedUnionOption<K>[]>(
  inputObjects: FilenameWithData[],
  validator: z.ZodDiscriminatedUnion<K, Options>
) => {
  const integrityFailureCount = { count: 0 };
  const input = inputObjects
    .map((str) => {
      const res = validator.safeParse(parseJSON(str.data, str.filename));
      if (!res.success) {
        window.api.log.error('Deserialization Error', str, res.error);
        integrityFailureCount.count++;
      }
      return res;
    })
    .filter((res): res is z.SafeParseSuccess<z.infer<typeof validator>> => res.success)
    .map(({ data }) => data);
  return {
    input,
    integrityFailureCount,
  };
};

export const zodDataToEntries = <I extends { dbSymbol: DbSymbol }>(input: I[]) => Object.fromEntries(input.map((d) => [d.dbSymbol, d]));

export const deserializeZodConfig = <I extends z.ZodRawShape>(inputObject: FilenameWithData, validator: z.ZodObject<I>) => {
  const validation = validator.safeParse(parseJSON(inputObject.data, inputObject.filename));
  if (validation.success) return validation.data;

  throw new Error(`Failed to parse config ${JSON.stringify(validation.error)}`);
};
