import React, { FunctionComponent } from 'react';
import { StatisticsDataBlockFieldsetProps } from './StatisticsDataBlockFieldsetPropsInterface';
import { StatisticsDataBlockFieldsetStyle } from './StatisticsDataBlockFieldsetStyle';

export const StatisticsDataBlockFieldset: FunctionComponent<StatisticsDataBlockFieldsetProps> = (
  props: StatisticsDataBlockFieldsetProps
) => {
  const { children } = props;
  return (
    <StatisticsDataBlockFieldsetStyle>
      {children}
    </StatisticsDataBlockFieldsetStyle>
  );
};
