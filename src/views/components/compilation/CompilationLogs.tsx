import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoggerInput } from '@components/inputs';
import { DarkButton } from '@components/buttons';
import type { StudioCompilation } from './CompilationDialogSchema';
import SuccessIcon from '@assets/icons/global/success-onboarding.svg';
import { useShowItemInFolder } from '@src/hooks/useShowItemInFolder';
import { join } from '@utils/path';
import { showNotification } from '@utils/showNotification';
import { useLoaderRef } from '@utils/loaderContext';
import { playSound } from '@utils/sound';
import { CompilationLogsContainer, ProgressBarCompilationContainer } from './CompilationStyle';
import { CopyButton } from '@components/Copy';
import { ONLY_SHOW_ON_CHANGE_TEXT } from '@ds/Tooltip/TooltipContext';

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
  const { t } = useTranslation();
  const logsRef = useRef<HTMLTextAreaElement>(null);
  const progressBarRef = useRef<HTMLProgressElement>(null);
  const loaderRef = useLoaderRef();
  const [exitCode, setExitCode] = useState<number | undefined | null>(undefined);
  const showItemInFolder = useShowItemInFolder();
  const isError = exitCode !== undefined && (exitCode === null || exitCode > 0);

  const getDataToCopy = () => {
    if (!logsRef.current) throw new Error('no logs to copy');

    return logsRef.current.textContent || '';
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

  // A build is long and the user has usually looked away. Sound the outcome
  // once it lands. The spawn-failure path (onFailure -> setError) sounds its own
  // error, and leaves exitCode undefined, so it can't double up with this.
  useEffect(() => {
    if (exitCode === undefined) return;
    playSound(exitCode === 0 ? 'success' : 'error');
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
      {(exitCode === undefined || exitCode === null || exitCode > 0) && (
        <ProgressBarCompilationContainer isError={isError}>
          <span className="progress-message">
            {isError ? t('error_occurred') : t('creating_executable_for')}
            {!isError && <span className="platform">{getPlatform()}</span>}
          </span>
          <progress max={7} className="progress" ref={progressBarRef} />
        </ProgressBarCompilationContainer>
      )}
      <div className="logs">
        <LoggerInput ref={logsRef} disabled />
        <div className="actions">
          <CopyButton message={ONLY_SHOW_ON_CHANGE_TEXT} dataToCopy={getDataToCopy}>
            {t('copy_to_clipboard')}
          </CopyButton>
          <DarkButton onClick={onClickSaveLogs}>{t('save_logs')}</DarkButton>
        </div>
      </div>
    </CompilationLogsContainer>
  );
};
