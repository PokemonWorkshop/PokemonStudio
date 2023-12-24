import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';

export const SettingsMapsPage = () => {
  const { t } = useTranslation('settings');
  return (
    <PageTemplate title={t('map_management')} size="default">
      <PageEditor title="Tiled" editorTitle={t('map_management')} />
    </PageTemplate>
  );
};
