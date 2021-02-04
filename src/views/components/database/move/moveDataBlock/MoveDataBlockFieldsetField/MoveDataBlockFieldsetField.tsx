import React, { FunctionComponent } from 'react';
import { MoveDataBlockFieldsetFieldProps } from './MoveDataBlockFieldsetFieldPropsInterface';
import { MoveDataBlockFieldsetFieldStyle } from './MoveDataBlockFieldsetFieldStyle';

export const MoveDataBlockFieldsetField: FunctionComponent<MoveDataBlockFieldsetFieldProps> = (
  props: MoveDataBlockFieldsetFieldProps
) => {
  const { label, data, size = 's' } = props;
  return (
    <MoveDataBlockFieldsetFieldStyle size={size}>
      <span>{label}</span>
      <span>{data}</span>
    </MoveDataBlockFieldsetFieldStyle>
  );
};
