export type MoveDataBlockFieldsetFieldProps = {
  label: string;
  data: string | number;
  size?: DataBlockSize;
};

export type MoveDataBlockFieldsetFieldStyleProps = {
  size?: DataBlockSize;
};

type DataBlockSize = 's' | 'm';

export const sizeToPx: Record<DataBlockSize, { width: string }> = {
  s: { width: '152px' },
  m: { width: '350px' },
};
