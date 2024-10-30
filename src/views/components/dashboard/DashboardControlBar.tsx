import { SecondaryButton } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlBar } from '@components/ControlBar';
import { DashboardDialogsRef } from './editors/DashboardEditorOverlay';

type DashboardControlBarProps = {
  dialogsRef: DashboardDialogsRef;
};

export const DashboardControlBar = ({ dialogsRef }: DashboardControlBarProps) => {
  const { t } = useTranslation('dashboard');

  const onClickPlayableGame = dialogsRef ? () => dialogsRef.current?.openDialog('create_playable_game', true) : undefined;

  return (
    <ControlBar>
      <SecondaryButton onClick={onClickPlayableGame}>{t('create_playable_version')}</SecondaryButton>
    </ControlBar>
  );
};
