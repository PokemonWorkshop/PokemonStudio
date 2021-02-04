import React, { FunctionComponent } from 'react';
import { MoveDataBlockProps } from './MoveDataBlockPropsInterface';
import { MoveDataBlockStyle } from './MoveDataBlockStyle';

export const MoveDataBlock: FunctionComponent<MoveDataBlockProps> = (
  props: MoveDataBlockProps
) => {
  const { size = 's', children, title } = props;
  return (
    <MoveDataBlockStyle size={size}>
      <h2>{title}</h2>
      {children}
    </MoveDataBlockStyle>
  );
};
