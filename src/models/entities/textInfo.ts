import { z } from 'zod';
import { POSITIVE_OR_ZERO_INT } from './common';

export const TEXT_INFO_VALIDATOR = z.object({
  klass: z.literal('TextInfo'),
  fileId: POSITIVE_OR_ZERO_INT,
  textId: POSITIVE_OR_ZERO_INT,
});
export type StudioTextInfo = z.infer<typeof TEXT_INFO_VALIDATOR>;

export const TEXT_INFO_NAME_TEXT_ID = 200000;
export const TEXT_INFO_DESCRIPTION_TEXT_ID = 200001;
