import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { Input, InputWithLeftLabelContainer, Label } from '@components/inputs';
import { useRefreshUI } from '@components/editor';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { cloneEntity } from '@utils/cloneEntity';

export const DashboardQuest = () => {
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();
  const currentEditedProjectStudio = useMemo(() => cloneEntity(projectStudio), [projectStudio]);
  const { t } = useTranslation('dashboard_texts');
  const refreshUI = useRefreshUI();

  return (
    <PageEditor editorTitle={t('texts')} title={t('quests')}>
      <InputWithLeftLabelContainer>
        <Label htmlFor="default-fileid">{t('default_value')}</Label>
        <Input
          name="default-fileid"
          min="0"
          value={projectStudio.defaultFileId as number | undefined}
          onChange={(event) => {
            const newVal: string = event.target.value;
            currentEditedProjectStudio.defaultFileId = newVal.length ? Number(newVal) : undefined;
            refreshUI(setProjectStudio(currentEditedProjectStudio));
          }}
        />
      </InputWithLeftLabelContainer>
    </PageEditor>
  );
};
