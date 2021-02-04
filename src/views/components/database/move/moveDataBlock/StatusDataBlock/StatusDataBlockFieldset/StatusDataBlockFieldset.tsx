import React, { FunctionComponent } from 'react';
import { StatusDataBlockFieldsetProps } from './StatusDataBlockFieldsetPropsInterface';
import { StatusDataBlockFieldsetStyle } from './StatusDataBlockFieldsetStyle';

export const StatusDataBlockFieldset: FunctionComponent<StatusDataBlockFieldsetProps> = (
  props: StatusDataBlockFieldsetProps
) => {
  const { children } = props;
  return (
    <StatusDataBlockFieldsetStyle>{children}</StatusDataBlockFieldsetStyle>
  );
};
