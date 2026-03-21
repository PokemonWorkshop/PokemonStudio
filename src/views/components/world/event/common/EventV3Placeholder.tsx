import React from 'react';
import { PageEmptyState } from '@components/pages';
import { useTranslation } from 'react-i18next';
import MapIcon from '@assets/icons/navigation/map-icon.svg';

export const EventV3Placeholder = () => {
  const { t } = useTranslation();

  return (
    <PageEmptyState
      title={t('event_empty_state_title')}
      icon={<MapIcon />}
      description={
        <>
          {t('event_empty_state_description_1')}
          <br />
          <br />
          {t('event_empty_state_description_2')}
        </>
      }
    />
  );
};
