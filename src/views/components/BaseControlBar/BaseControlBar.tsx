import React, { FunctionComponent, ReactNode } from 'react';
import { ControlBarProps } from './BaseControlBarPropsInterface';
import { BaseControlBarStyle } from './BaseControlBarStyle';

const ControlBar: FunctionComponent<{ children?: ReactNode }> = (
  props: ControlBarProps
) => {
  const { children } = props;
  return <BaseControlBarStyle>{children}</BaseControlBarStyle>;
};

export { ControlBar };
