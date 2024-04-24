import { z } from 'zod';

export class InvalidJSONError extends Error {
  public filename: string;
  public cause: unknown;
  constructor(filename: string, cause: unknown) {
    super(`Invalid JSON Data \n File: ${filename} \n\n ${cause}`);
    this.filename = filename;
    this.cause = cause;
  }
}

export const parseJSON = <T>(content: string, filename: string): T => {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new InvalidJSONError(filename, error);
  }
};

export const safeParseJSON = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, content: string, filename: string) => {
  try {
    return schema.safeParse(JSON.parse(content));
  } catch (error) {
    return { success: false, error: new InvalidJSONError(filename, error) } as const;
  }
};
