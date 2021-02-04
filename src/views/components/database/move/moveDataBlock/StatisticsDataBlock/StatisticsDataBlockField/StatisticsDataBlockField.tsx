import React, { FunctionComponent } from 'react';
import { StatisticsDataBlockFieldProps } from './StatisticsDataBlockFieldPropsInterface';
import { StatisticsDataBlockFieldStyle } from './StatisticsDataBlockFieldStyle';

export const StatisticsDataBlockField: FunctionComponent<StatisticsDataBlockFieldProps> = (
  props: StatisticsDataBlockFieldProps
) => {
  const { label, data } = props;
  return (
    <StatisticsDataBlockFieldStyle>
      <span>{label}</span>
      <span>{data}</span>
    </StatisticsDataBlockFieldStyle>
  );
};
