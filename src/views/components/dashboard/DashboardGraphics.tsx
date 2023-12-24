import React, { useMemo } from 'react';
import { InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigGraphic } from '@utils/useProjectConfig';
import { cloneEntity } from '@utils/cloneEntity';

export const DashboardGraphics = () => {
  const { t } = useTranslation('dashboard_graphics');
  const { projectConfigValues: graphics, setProjectConfigValues: setGraphics } = useConfigGraphic();
  const currentEditedGraphics = useMemo(() => cloneEntity(graphics), [graphics]);

  return (
    <PageEditor editorTitle={t('graphic_settings')} title={t('settings')}>
      <InputWithLeftLabelContainer>
        <Label htmlFor="textures">{t('texture_smoothing')}</Label>
        <Toggle
          name="textures"
          checked={currentEditedGraphics.isSmoothTexture}
          onChange={(event) => {
            currentEditedGraphics.isSmoothTexture = event.target.checked;
            setGraphics(currentEditedGraphics);
          }}
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="vsync">{t('vsync')}</Label>
        <Toggle
          name="vsync"
          checked={currentEditedGraphics.isVsyncEnabled}
          onChange={(event) => {
            currentEditedGraphics.isVsyncEnabled = event.target.checked;
            setGraphics(currentEditedGraphics);
          }}
        />
      </InputWithLeftLabelContainer>
    </PageEditor>
  );
};
