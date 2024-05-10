import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { DashboardGameOptionsInactive } from './DashboardGameOptionsInactive';
import { DashboardGameOptionsActive } from './DashboardGameOptionsActive';

export const DashboardGameOptions = () => {
  const { t } = useTranslation('dashboard_game_options');

  return (
    <>
      <PageEditor editorTitle={t('game_options')} title={t('active_options')} canCollapse>
        <DashboardGameOptionsActive />
      </PageEditor>
      <PageEditor editorTitle={t('game_options')} title={t('inactive_options')} canCollapse>
        <DashboardGameOptionsInactive />
      </PageEditor>
    </>
  );
};
