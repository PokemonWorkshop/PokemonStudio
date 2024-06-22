import { useZodForm } from '@utils/useZodForm';
import { COMPILATION_DIALOG_SCHEMA, StudioCompilation } from './CompilationDialogSchema';
import { useConfigInfos } from '@utils/useProjectConfig';
import { StudioInfoConfig } from '@modelEntities/config';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { ClearButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import React from 'react';
import { CompilationDialogContainer, CompilationFormContainer } from './CompilationDialogStyle';
import { CompilationOptions } from './CompilationOptions';

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
  //const { t } = useTranslation('compilation');

  const onClickCompile = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      console.log(result.data);
      // TODO: open new window
    }
  };

  return (
    <CompilationDialogContainer>
      <div className="header">
        <span className="title">{"Création d'une version jouable"}</span>
        <ClearButtonOnlyIcon onClick={closeDialog} className="icon" />
      </div>
      <CompilationFormContainer ref={formRef}>
        <div className="game-info">
          <Input name="gameName" placeholder={gameInfo.gameTitle} label={'Nom du jeu'} labelLeft onInput={onInputTouched} />
          <Input name="gameVersion" placeholder={gameInfo.gameVersion + 1} label={'Numéro de version'} labelLeft onInput={onInputTouched} />
        </div>
        <CompilationOptions defaults={defaults} />
        <div className="actions">
          <span className="executable-info">L’exécutable créée sera jouable uniquement sur les systèmes Windows 10 et Windows 11</span>
          <PrimaryButton onClick={onClickCompile}>Compiler le projet</PrimaryButton>
        </div>
      </CompilationFormContainer>
    </CompilationDialogContainer>
  );
};
