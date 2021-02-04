import { ReactNode } from 'react';

export type PokemonDataBlockProps = {
  title: string;
  size?: DataBlockSize;
  children: ReactNode;
};

export type PokemonDataBlockStyleProps = {
  size?: DataBlockSize;
};

type DataBlockSize = 's' | 'm';

export const sizeToPx: Record<
  DataBlockSize,
  { width: string; height: string }
> = {
  s: { width: '244px', height: '254px' },
  m: { width: '504px', height: '288px' },
};
