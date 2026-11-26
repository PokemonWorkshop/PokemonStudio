import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EventEditorProps } from '../EventEditorProps';

const Info = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

export const StopEventExecutionEditor = forwardRef<EditorHandlingClose, EventEditorProps>((_, ref) => {
  const { t } = useTranslation();

  useEditorHandlingClose(ref);
  return (
    <Editor type="edit" title={t('event_command_stop_event_execution')}>
      <InputFormContainer>
        <Info>{t('event_command_no_parameters')}</Info>
      </InputFormContainer>
    </Editor>
  );
});

StopEventExecutionEditor.displayName = 'StopEventExecutionEditor';
