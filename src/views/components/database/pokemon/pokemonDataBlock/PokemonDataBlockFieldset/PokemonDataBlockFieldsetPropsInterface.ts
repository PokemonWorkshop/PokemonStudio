import { ReactNode } from 'react';

export type PokemonDataBlockFieldsetProps = {
  size?: FieldsetSize;
  children: ReactNode;
};

export type PokemonDataBlockFieldsetStyleProps = {
  size?: FieldsetSize;
};

type FieldsetSize = 's' | 'm';

export const sizeToPx: Record<FieldsetSize, { gap: string }> = {
  s: { gap: '16px' },
  m: { gap: '24px' },
};
