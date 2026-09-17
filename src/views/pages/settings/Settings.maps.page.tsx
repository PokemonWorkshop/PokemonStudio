import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor, PageTemplate } from '@components/pages';
import { InputWithTopLabelContainer, Label, DropInput, FileInput } from '@components/inputs';
import styled from 'styled-components';
import { Link } from '@components/Link';
import LinkStyle from '@components/Link/LinkStyle';
import { getSetting, updateSettings } from '@utils/settings';
import { basename } from '@utils/path';
import { showNotification } from '@utils/showNotification';

const DownloadMessageContainer = styled.div`
  display: flex;
  gap: 4px;
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};

  ${LinkStyle} {
    color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

export const SettingsMapsPage = () => {
  const [tiledPath, setTiledPath] = useState(getSetting('tiledPath'));
  const { t } = useTranslation();
  const isWin32 = window.api.platform === 'win32';

  const handleFileChoosen = (filePath: string) => {
    if (isWin32 && basename(filePath).toLowerCase() !== 'tiled.exe') {
      showNotification('danger', t('map_management'), t('tiled_path_invalid_path_error'));
      return;
    }

    setTiledPath(filePath);
    updateSettings('tiledPath', filePath);
  };

  const handleFileClear = () => {
    setTiledPath('');
    updateSettings('tiledPath', '');
  };

  return (
    <PageTemplate title={t('map_management')} size="default">
      <PageEditor title="Tiled" editorTitle={t('map_management')}>
        <InputWithTopLabelContainer>
          <Label>{t('tiled_path')}</Label>
          {tiledPath ? (
            <FileInput
              filePath={tiledPath}
              name={isWin32 ? t('tiled_exe') : 'Tiled'}
              extensions={isWin32 ? ['exe'] : ['*']}
              onFileChoosen={handleFileChoosen}
              onFileClear={handleFileClear}
              isAbsolutePath
              showFullPath
              noIcon
            />
          ) : (
            <DropInput name={isWin32 ? t('tiled_exe') : 'Tiled'} extensions={isWin32 ? ['exe'] : ['*']} onFileChoosen={handleFileChoosen} />
          )}
          <DownloadMessageContainer>
            {t('download_message')}
            <Link external href="https://www.mapeditor.org" text={t('official_website')} />
          </DownloadMessageContainer>
        </InputWithTopLabelContainer>
      </PageEditor>
    </PageTemplate>
  );
};
