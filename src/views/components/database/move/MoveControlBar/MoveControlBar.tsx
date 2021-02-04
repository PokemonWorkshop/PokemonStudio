import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveControlBarStyle } from './MoveControlBarStyle';

export const MoveControlBar: FunctionComponent = () => {
  const { t } = useTranslation(['database_moves']);

  return <MoveControlBarStyle />;
};
