import React, { FunctionComponent } from 'react';
import { StatisticsDataBlockFieldGroupProps } from './StatisticsDataBlockFieldGroupPropsInterface';
import { StatisticsDataBlockFieldGroupStyle } from './StatisticsDataBlockFieldGroupStyle';

export const StatisticsDataBlockFieldGroup: FunctionComponent<StatisticsDataBlockFieldGroupProps> = (
  props: StatisticsDataBlockFieldGroupProps
) => {
  const { children } = props;
  return (
    <StatisticsDataBlockFieldGroupStyle>
      {children}
    </StatisticsDataBlockFieldGroupStyle>
  );
};
