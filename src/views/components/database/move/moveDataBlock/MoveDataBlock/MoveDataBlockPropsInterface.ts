import { ReactNode } from 'react';

export type MoveDataBlockProps = {
  title: string;
  size?: DataBlockSize;
  children: ReactNode;
};

export type MoveDataBlockStyleProps = {
  size?: DataBlockSize;
};

type DataBlockSize = 's' | 'm' | 'xl';

export const sizeToPx: Record<
  DataBlockSize,
  { width: string; height: string }
> = {
  s: { width: '504px', height: '219px' },
  m: { width: '504px', height: '254px' },
  xl: { width: '1024px', height: '154px' },
};
