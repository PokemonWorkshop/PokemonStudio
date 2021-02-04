import React, { FunctionComponent } from 'react';
import { MoveDataBlockFieldsetProps } from './MoveDataBlockFieldsetPropsInterface';
import { MoveDataBlockFieldsetStyle } from './MoveDataBlockFieldsetStyle';

export const MoveDataBlockFieldset: FunctionComponent<MoveDataBlockFieldsetProps> = (
  props: MoveDataBlockFieldsetProps
) => {
  const { children } = props;
  return <MoveDataBlockFieldsetStyle>{children}</MoveDataBlockFieldsetStyle>;
};
