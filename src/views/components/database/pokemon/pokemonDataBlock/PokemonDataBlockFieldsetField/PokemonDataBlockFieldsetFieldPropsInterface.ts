export type PokemonDataBlockFieldsetFieldProps = {
  size?: FieldSize;
  label: string;
  data: string | number;
};

export type PokemonDataBlockFieldsetFieldStyleProps = {
  size?: FieldSize;
};

type FieldSize = 's' | 'm';

export const sizeToPx: Record<FieldSize, { gap: string }> = {
  s: { gap: '4px' },
  m: { gap: '8px' },
};
