import { useZodForm } from '@hooks/useZodForm';
import { COMPILATION_DIALOG_SCHEMA, StudioCompilation } from './CompilationDialogSchema';
import { useConfigInfos } from '@hooks/useProjectConfig';
import { StudioInfoConfig } from '@modelEntities/config';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { ClearButtonOnlyIcon, PrimaryButton } from '@components/buttons';
import { CompilationDialogContainer, CompilationFormContainer } from './CompilationStyle';
import { CompilationOptions } from './CompilationOptions';
import { TFunction, useTranslation } from 'react-i18next';
import { useLoaderRef } from '@utils/loaderContext';
import { State, useGlobalState } from '@src/GlobalStateProvider';
import { updateProjectStudio } from '@utils/projectList';
import React from 'react';

const initForm = (gameInfo: StudioInfoConfig, state: State): StudioCompilation => {
  return {
    projectPath: state.projectPath || '',
    gameName: gameInfo.gameTitle,
    gameVersion: gameInfo.gameVersion + 1,
    updateVisual: true,
    updateData: true,
    updateLibraries: true,
    updateAudio: true,
    updateBinaries: false,
  };
};

const getExecutableInfoText = (t: TFunction<'compilation'>) => {
  const platform = window.api.platform;
  if (platform === 'darwin') return t('executable_info_darwin');
  if (platform === 'linux') return t('executable_info_linux');

  return t('executable_info_windows');
};

type CompilationDialogProps = {
  closeDialog: () => void;
};

export const CompilationDialog = ({ closeDialog }: CompilationDialogProps) => {
  const { projectConfigValues: gameInfo, state } = useConfigInfos();
  const [, setGlobalState] = useGlobalState();
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(COMPILATION_DIALOG_SCHEMA, initForm(gameInfo, state));
  const { Input } = useInputAttrsWithLabel(COMPILATION_DIALOG_SCHEMA, defaults);
  const { t } = useTranslation('compilation');
  const loaderRef = useLoaderRef();

  const onClickCompile = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const configuration = result.data;
      window.api.openCompilationWindow(
        { configuration },
        () => {
          // Silent update of the game name and game version
          setGlobalState((state) => {
            const newState = {
              ...state,
              projectConfig: {
                ...state.projectConfig,
                infos_config: { ...state.projectConfig.infos_config, gameTitle: configuration.gameName, gameVersion: configuration.gameVersion },
              },
              projectStudio: {
                ...state.projectStudio,
                title: configuration.gameName,
              },
            };
            // Update project list in the local storage
            if (newState.projectPath) updateProjectStudio(newState.projectPath, newState.projectStudio);
            return newState;
          });
          closeDialog();
        },
        ({ errorMessage }) => {
          // we wait the end of the close dialog animation to show the result
          setTimeout(() => loaderRef.current.setError('compilation_project_error', errorMessage, true), 200);
          closeDialog();
        }
      );
    }
  };

  return (
    <CompilationDialogContainer>
      <div className="header">
        <span className="title">{t('compilation_dialog_title')}</span>
        <ClearButtonOnlyIcon onClick={closeDialog} className="icon" />
      </div>
      <CompilationFormContainer ref={formRef}>
        <Input name="projectPath" style={{ display: 'none' }} />
        <div className="game-info">
          <Input name="gameName" placeholder={gameInfo.gameTitle} label={t('game_name')} labelLeft onInput={onInputTouched} />
          <Input name="gameVersion" placeholder={gameInfo.gameVersion + 1} label={t('version_number')} labelLeft onInput={onInputTouched} />
        </div>
        <CompilationOptions defaults={defaults} />
        <div className="actions">
          <span className="executable-info">{getExecutableInfoText(t)}</span>
          <PrimaryButton onClick={onClickCompile}>{t('compile_project')}</PrimaryButton>
        </div>
      </CompilationFormContainer>
    </CompilationDialogContainer>
  );
};
