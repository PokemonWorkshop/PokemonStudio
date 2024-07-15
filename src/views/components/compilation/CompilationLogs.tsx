import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoggerInput } from '@components/inputs';
import { DarkButton } from '@components/buttons';
import type { StudioCompilation } from './CompilationDialogSchema';
import { ReactComponent as SuccessIcon } from '@assets/icons/global/success-onboarding.svg';
import { useShowItemInFolder } from '@src/hooks/useShowItemInFolder';
import { join } from '@utils/path';
import { BlockProgressBar } from '@components/progress-bar/ProgressBar';
import { showNotification } from '@utils/showNotification';
import { useLoaderRef } from '@utils/loaderContext';

type ProgressBarCompilationContainerProps = {
  isError: boolean;
};

const ProgressBarCompilationContainer = styled(BlockProgressBar)<ProgressBarCompilationContainerProps>`
  justify-content: initial;
  gap: 12px;
  width: 100%;

  .progress {
    width: 100%;
    height: 12px;
  }

  .progress::-webkit-progress-value {
    background: ${({ theme, isError }) => (isError ? theme.colors.dangerBase : theme.colors.successBase)};
  }

  .progress-message {
    ${({ theme, isError }) => (isError ? theme.fonts.normalMedium : theme.fonts.normalRegular)}
    color: ${({ theme, isError }) => (isError ? theme.colors.dangerBase : theme.colors.text100)};
  }

  .platform {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const CompilationLogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  user-select: none;
  height: 100%;
  width: 100%;

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    ${({ theme }) => theme.colors.text100};
  }

  .logs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;

    ${LoggerInput} {
      height: 100%;
      overflow-y: scroll;
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

const getPlatform = () => {
  const platform = window.api.platform;
  if (platform === 'linux') return 'Linux';
  if (platform === 'darwin') return 'macOS';
  return 'Windows';
};

type CompilationLogsProps = {
  configuration: StudioCompilation;
};

export const CompilationLogs = ({ configuration }: CompilationLogsProps) => {
  const { t } = useTranslation('compilation');
  const logsRef = useRef<HTMLTextAreaElement>(null);
  const progressBarRef = useRef<HTMLProgressElement>(null);
  const loaderRef = useLoaderRef();
  const [exitCode, setExitCode] = useState<number | undefined>(undefined);
  const showItemInFolder = useShowItemInFolder();
  const isError = exitCode !== undefined && exitCode > 0;

  const onClickClipboard = () => {
    if (!logsRef.current) return;

    navigator.clipboard.writeText(logsRef.current.textContent || '');
  };

  const onClickSaveLogs = () => {
    if (!logsRef.current) return;

    window.api.saveCompilationLogs(
      { projectPath: configuration.projectPath, logs: logsRef.current.textContent || '' },
      () => showNotification('success', t('save_logs_title_success'), t('save_logs_success')),
      () => showNotification('danger', t('save_logs_title_failure'), t('save_logs_failure'))
    );
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
      ({ exitCode }) => setExitCode(exitCode),
      ({ errorMessage }) => {
        loaderRef.current.setError('compilation_project_error', errorMessage);
      },
      ({ stepText, step }) => {
        if (logsRef.current) {
          logsRef.current.textContent = logsRef.current.textContent + stepText;
          logsRef.current.scrollTop = logsRef.current.scrollHeight;
        }
        if (progressBarRef.current) progressBarRef.current.value = step;
      }
    );
  }, []);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [exitCode]);

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
      {(exitCode === undefined || exitCode > 0) && (
        <ProgressBarCompilationContainer isError={isError}>
          <span className="progress-message">
            {isError ? t('error_occurred') : t('creating_executable_for')}
            {!isError && <span className="platform">{getPlatform()}</span>}
          </span>
          <progress max={7} className="progress" ref={progressBarRef} />
        </ProgressBarCompilationContainer>
      )}
      <div className="logs">
        <LoggerInput ref={logsRef} readOnly />
        <div className="actions">
          <DarkButton onClick={onClickClipboard}>{t('copy_to_clipboard')}</DarkButton>
          <DarkButton onClick={onClickSaveLogs}>{t('save_logs')}</DarkButton>
        </div>
      </div>
    </CompilationLogsContainer>
  );
};
