import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusDataBlockFieldsetFieldProps } from './StatusDataBlockFieldsetFieldPropsInterface';
import { StatusDataBlockFieldsetFieldStyle } from './StatusDataBlockFieldsetFieldStyle';

export const StatusDataBlockFieldsetField: FunctionComponent<StatusDataBlockFieldsetFieldProps> = (
  props: StatusDataBlockFieldsetFieldProps
) => {
  const { label, data } = props;
  const { t } = useTranslation('database_moves');

  function getData() {
    if (data === 'none') return t('none');
    return data;
  }

  function getDataForStyle() {
    if (data === '0 %') return 'none';
    return data;
  }

  return (
    <StatusDataBlockFieldsetFieldStyle data={getDataForStyle()}>
      <span>{label}</span>
      <span>{getData()}</span>
    </StatusDataBlockFieldsetFieldStyle>
  );
};
