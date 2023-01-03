import { z } from 'zod';

export const POSITIVE_OR_ZERO_INT = z.number().finite().nonnegative();
export const POSITIVE_INT = z.number().finite().positive();
export const POSITIVE_OR_ZERO_FLOAT = z.number().nonnegative();
export const POSITIVE_FLOAT = z.number().positive();
