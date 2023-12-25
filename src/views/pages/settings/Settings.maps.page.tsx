import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';
import { InputWithLeftLabelContainer, Label, Toggle, InputWithTopLabelContainer, DropInput, FileInput } from '@components/inputs';
import { useProjectStudio } from '@utils/useProjectStudio';
import styled from 'styled-components';
import { Link } from '@components/Link';
import LinkStyle from '@components/Link/LinkStyle';
import { getSetting, updateSettings } from '@utils/settings';

const DownloadMessageContainer = styled.div`
  display: flex;
  gap: 4px;
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};

  ${LinkStyle} {
    color: ${({ theme }) => theme.colors.primaryBase};
    cursor: pointer;
  }
`;

export const SettingsMapsPage = () => {
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio } = useProjectStudio();
  const [tiledPath, setTiledPath] = useState(getSetting('tiledPath'));
  const { t } = useTranslation(['settings', 'settings_maps']);

  const handleFileChoosen = (filePath: string) => {
    setTiledPath(filePath);
    updateSettings('tiledPath', filePath);
  };

  const handleFileClear = () => {
    setTiledPath('');
    updateSettings('tiledPath', '');
  };

  return (
    <PageTemplate title={t('settings:map_management')} size="default">
      <PageEditor title="Tiled" editorTitle={t('settings:map_management')}>
        <InputWithLeftLabelContainer>
          <Label>{t('settings_maps:use_tiled')}</Label>
          <Toggle
            name="use_tiled"
            checked={projectStudio.isTiledMode || false}
            onChange={(event) => setProjectStudio({ ...projectStudio, isTiledMode: event.target.checked })}
            disabled={projectStudio.isTiledMode || false}
          />
        </InputWithLeftLabelContainer>
        {projectStudio.isTiledMode && (
          <InputWithTopLabelContainer>
            <Label>{t('settings_maps:tiled_path')}</Label>
            {tiledPath ? (
              <FileInput
                filePath={tiledPath}
                name={t('settings_maps:tiled_exe')}
                extensions={['exe']}
                onFileChoosen={handleFileChoosen}
                onFileClear={handleFileClear}
                isAbsolutePath
                showFullPath
                noIcon
              />
            ) : (
              <DropInput name={t('settings_maps:tiled_exe')} extensions={['exe']} onFileChoosen={handleFileChoosen} />
            )}
            <DownloadMessageContainer>
              {t('settings_maps:download_message')}
              <Link external href="https://www.mapeditor.org" text={t('settings_maps:official_website')} />
            </DownloadMessageContainer>
          </InputWithTopLabelContainer>
        )}
      </PageEditor>
    </PageTemplate>
  );
};
