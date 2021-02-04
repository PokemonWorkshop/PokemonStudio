import React, { FunctionComponent } from 'react';
import { StatisticsDataBlockFieldGroupProps } from './StatisticsDataBlockFieldGroupPropsInterface';
import { StatisticsDataBlockFieldGroupStyle } from './StatisticsDataBlockFieldGroupStyle';

export const StatisticsDataBlockFieldGroup: FunctionComponent<StatisticsDataBlockFieldGroupProps> = (
  props: StatisticsDataBlockFieldGroupProps
) => {
  const { children, title } = props;
  return (
    <StatisticsDataBlockFieldGroupStyle>
      <h3>{title}</h3>
      {children}
    </StatisticsDataBlockFieldGroupStyle>
  );
};
