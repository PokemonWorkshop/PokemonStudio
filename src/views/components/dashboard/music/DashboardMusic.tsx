import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';

export const DashboardMusic = () => {
  const { t } = useTranslation();

  return <PageEditor editorTitle={t('music_default')} title={t('interfaces')}></PageEditor>;
};
