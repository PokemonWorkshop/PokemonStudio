import styled from 'styled-components';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiLineInput } from '@components/inputs';
import { DarkButton } from '@components/buttons';

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
    }

    .actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
      justify-content: flex-end;
    }
  }
`;

export const CompilationLogs = () => {
  const { t } = useTranslation('compilation');
  const logsRef = useRef<HTMLTextAreaElement>(null);

  const onClickClipboard = () => {
    if (!logsRef.current) return;

    navigator.clipboard.writeText(logsRef.current.textContent || '');
  };

  const onClickSaveLogs = () => {
    if (!logsRef.current) return;

    // TODO: send the logs to the backend
    //logsRef.current.textContent
  };

  useEffect(() => {
    console.log('start compilation!');
  }, []);

  return (
    <CompilationLogsContainer>
      <span className="title">{t('compilation_dialog_title')}</span>
      {/* TODO: progress bar */}
      <div className="logs">
        <MultiLineInput ref={logsRef} readOnly defaultValue={'Compilation logs...'} />
        <div className="actions">
          <DarkButton onClick={onClickClipboard}>{t('copy_to_clipboard')}</DarkButton>
          <DarkButton onClick={onClickSaveLogs}>{t('save_logs')}</DarkButton>
        </div>
      </div>
    </CompilationLogsContainer>
  );
};
