import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiLineInput } from '@components/inputs';
import { DarkButton } from '@components/buttons';
import type { StudioCompilation } from './CompilationDialogSchema';
import { ReactComponent as SuccessIcon } from '@assets/icons/global/success-onboarding.svg';
import { useShowItemInFolder } from '@src/hooks/useShowItemInFolder';
import { join } from '@utils/path';

const CompilationLogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  user-select: none;
  height: 100%;

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    ${({ theme }) => theme.colors.text100};
  }

  .logs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;

    ${MultiLineInput} {
      min-height: calc(100% - 52px);
      overflow-y: scroll;
      ${({ theme }) => theme.fonts.codeRegular}
    }

    .actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  .success {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 8px 16px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.successBase};
    background-color: ${({ theme }) => theme.colors.successSoft};
    min-height: 56px;
    box-sizing: border-box;

    .icon-message {
      display: flex;
      gap: 16px;
      color: ${({ theme }) => theme.colors.successBase};
      align-items: center;

      .message {
        ${({ theme }) => theme.fonts.normalRegular}
        color: ${({ theme }) => theme.colors.text100};
      }
    }

    .show-folder {
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.successBase};

      :hover {
        cursor: pointer;
      }
    }
  }

  .error {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

type CompilationLogsProps = {
  configuration: StudioCompilation;
};

export const CompilationLogs = ({ configuration }: CompilationLogsProps) => {
  const { t } = useTranslation('compilation');
  const logsRef = useRef<HTMLTextAreaElement>(null);
  const [exitCode, setExitCode] = useState<number | undefined>(undefined);
  const showItemInFolder = useShowItemInFolder();

  const onClickClipboard = () => {
    if (!logsRef.current) return;

    navigator.clipboard.writeText(logsRef.current.textContent || '');
  };

  const onClickSaveLogs = () => {
    if (!logsRef.current) return;

    // TODO: send the logs to the backend
    //logsRef.current.textContent
  };

  const onClickShowFolder = () => {
    showItemInFolder(
      { filePath: join(configuration.projectPath, window.api.platform === 'win32' ? 'Release/Game.exe' : 'Release/Game.rb') },
      () => {},
      () => {}
    );
  };

  useEffect(() => {
    window.api.startCompilation(
      { configuration },
      ({ exitCode }) => {
        setExitCode(exitCode);
      },
      () => {},
      ({ stepText }) => {
        if (logsRef.current) {
          logsRef.current.scrollTop = logsRef.current.scrollHeight;
          logsRef.current.textContent = logsRef.current.textContent + stepText;
        }
      }
    );
  }, []);

  return (
    <CompilationLogsContainer>
      <span className="title">{t('compilation_dialog_title')}</span>
      {exitCode === 0 && (
        <div className="success">
          <div className="icon-message">
            <SuccessIcon />
            <span className="message">{t('executable_create_successfully')}</span>
          </div>
          <span className="show-folder" onClick={onClickShowFolder}>
            {t('show_in_folder')}
          </span>
        </div>
      )}
      {exitCode !== 0 && exitCode !== undefined && <div className="error">{t('error_occurred')}</div>}
      <div className="logs">
        <MultiLineInput ref={logsRef} readOnly />
        <div className="actions">
          <DarkButton onClick={onClickClipboard}>{t('copy_to_clipboard')}</DarkButton>
          <DarkButton onClick={onClickSaveLogs}>{t('save_logs')}</DarkButton>
        </div>
      </div>
    </CompilationLogsContainer>
  );
};
