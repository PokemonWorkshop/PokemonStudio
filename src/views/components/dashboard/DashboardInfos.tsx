import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { join } from '@utils/path';
import { IconInput, Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DropInput } from '@components/inputs/DropInput';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import { DashboardEditor } from './DashboardEditor';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { useProjectStudio } from '@utils/useProjectStudio';
import { useConfigInfos } from '@utils/useProjectConfig';
import { useImageSaving } from '@utils/useImageSaving';
import { cloneEntity } from '@utils/cloneEntity';

const InputVersion = styled(Input)`
  text-align: left;
`;

export const DashboardInfos = () => {
  const { t } = useTranslation(['dashboard', 'dashboard_infos']);
  const [state] = useGlobalState();
  const { projectConfigValues: infos, setProjectConfigValues: setInfos } = useConfigInfos();
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();
  const currentEditedInfos = useMemo(() => cloneEntity(infos), [infos]);
  const currentEditedProjectStudio = useMemo(() => cloneEntity(projectStudio), [projectStudio]);
  const [gameTitleVersion, setGameTitleVersion] = useState({ gameTitle: infos.gameTitle, gameVersion: infos.gameVersion });
  const { addImage, removeImage, getImage } = useImageSaving();

  const onChangeGameTitle = (gameTitle: string) => {
    setGameTitleVersion({ ...gameTitleVersion, gameTitle: gameTitle });
  };

  const onBlurGameTitle = (gameTitle: string) => {
    currentEditedInfos.gameTitle = gameTitle.length === 0 ? 'Pokémon SDK' : gameTitle;
    currentEditedProjectStudio.title = currentEditedInfos.gameTitle;
    setInfos(currentEditedInfos);
    setProjectStudio(currentEditedProjectStudio);
  };

  const onChangeGameVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const gameVersion = parseInt(event.target.value);
    if (gameVersion < 1 || gameVersion > 99999) return event.preventDefault();
    setGameTitleVersion({ ...gameTitleVersion, gameVersion: gameVersion });
  };

  const onBlurGameVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const gameVersion = cleanNaNValue(parseInt(event.target.value), 1);
    if (gameVersion < 1 || gameVersion > 99999) return event.preventDefault();
    currentEditedInfos.gameVersion = gameVersion;
    setInfos(currentEditedInfos);
  };

  const onIconChoosen = (iconPath: string) => {
    addImage('project_icon.png', iconPath);
    //currentEditedProjectStudio.iconPath = iconPath.substring((state.projectPath || '').length);
    currentEditedProjectStudio.iconPath = 'project_icon.png';
    setProjectStudio(currentEditedProjectStudio);
  };

  const onIconClear = () => {
    removeImage('project_icon.png');
    currentEditedProjectStudio.iconPath = '';
    setProjectStudio(currentEditedProjectStudio);
  };

  return (
    <DashboardEditor editorTitle={t('dashboard:infos')} title={t('dashboard_infos:project')}>
      <InputWithTopLabelContainer>
        <Label htmlFor="project-name">{t('dashboard_infos:project_name')}</Label>
        <Input
          type="text"
          name="project-name"
          value={gameTitleVersion.gameTitle}
          onChange={(event) => onChangeGameTitle(event.target.value)}
          onBlur={(event) => onBlurGameTitle(event.target.value)}
          placeholder={t('dashboard_infos:pokemon_sdk')}
        />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="project-version">{t('dashboard_infos:project_version')}</Label>
        <InputVersion
          type="number"
          name="project-version"
          min="1"
          max="99999"
          value={isNaN(gameTitleVersion.gameVersion) ? '' : gameTitleVersion.gameVersion}
          onChange={onChangeGameVersion}
          onBlur={onBlurGameVersion}
          placeholder="256"
        />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="project-version">{t('dashboard_infos:project_icon')}</Label>
        {projectStudio.iconPath.length === 0 ? (
          <DropInput imageWidth={128} imageHeight={128} name={t('dashboard_infos:project_icon')} extensions={['png']} onFileChoosen={onIconChoosen} />
        ) : (
          <IconInput
            name={t('dashboard_infos:project_icon')}
            extensions={['png']}
            iconPath={getImage('project_icon.png') ?? join(state.projectPath || '', projectStudio.iconPath)}
            onIconChoosen={onIconChoosen}
            onIconClear={onIconClear}
          />
        )}
      </InputWithTopLabelContainer>
    </DashboardEditor>
  );
};
