import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import styled from 'styled-components';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';

const EditorsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DashboardSoundDesign = () => {
  const { t } = useTranslation();
  const { projectConfigValues: soundDesign, setProjectConfigValues: setSoundDesign } = useConfigSoundDesign();
  console.log(soundDesign);
  return (
    <EditorsContainer>
      <PageEditor editorTitle={t('sound_default')} title={t('interfaces')} canCollapse></PageEditor>
      <PageEditor editorTitle={t('sound_default')} title={t('interactions')} canCollapse></PageEditor>
      <PageEditor editorTitle={t('sound_default')} title={t('fights')} canCollapse></PageEditor>
      <PageEditor editorTitle={t('sound_default')} title={t('creatures')} canCollapse></PageEditor>
      <PageEditor editorTitle={t('sound_default')} title={t('objects')} canCollapse></PageEditor>
    </EditorsContainer>
  );
};
