import { useZodForm } from '@utils/useZodForm';
import { COMPILATION_DIALOG_SCHEMA, StudioCompilation } from './CompilationDialogSchema';
import { useConfigInfos } from '@utils/useProjectConfig';
import { StudioInfoConfig } from '@modelEntities/config';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { ClearButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { CompilationDialogContainer, CompilationFormContainer } from './CompilationDialogStyle';
import { CompilationOptions } from './CompilationOptions';
import { useTranslation } from 'react-i18next';
import React from 'react';

const initForm = (gameInfo: StudioInfoConfig): StudioCompilation => {
  return {
    gameName: gameInfo.gameTitle,
    gameVersion: gameInfo.gameVersion + 1,
    updateVisual: true,
    updateData: true,
    updateLibraries: true,
    updateAudio: true,
    updateBinaries: false,
  };
};

type CompilationDialogProps = {
  closeDialog: () => void;
};

export const CompilationDialog = ({ closeDialog }: CompilationDialogProps) => {
  const { projectConfigValues: gameInfo } = useConfigInfos();
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(COMPILATION_DIALOG_SCHEMA, initForm(gameInfo));
  const { Input } = useInputAttrsWithLabel(COMPILATION_DIALOG_SCHEMA, defaults);
  const { t } = useTranslation('compilation');

  const onClickCompile = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      console.log(result.data);
      // TODO: open new window
    }
  };

  const getExecutableInfoText = () => {
    const platform = window.api.platform;
    if (platform === 'darwin') return t('executable_info_darwin');
    if (platform === 'linux') return t('executable_info_linux');

    return t('executable_info_windows');
  };

  return (
    <CompilationDialogContainer>
      <div className="header">
        <span className="title">{t('compilation_dialog_title')}</span>
        <ClearButtonOnlyIcon onClick={closeDialog} className="icon" />
      </div>
      <CompilationFormContainer ref={formRef}>
        <div className="game-info">
          <Input name="gameName" placeholder={gameInfo.gameTitle} label={t('game_name')} labelLeft onInput={onInputTouched} />
          <Input name="gameVersion" placeholder={gameInfo.gameVersion + 1} label={t('version_number')} labelLeft onInput={onInputTouched} />
        </div>
        <CompilationOptions defaults={defaults} />
        <div className="actions">
          <span className="executable-info">{getExecutableInfoText()}</span>
          <PrimaryButton onClick={onClickCompile}>{t('compile_project')}</PrimaryButton>
        </div>
      </CompilationFormContainer>
    </CompilationDialogContainer>
  );
};
