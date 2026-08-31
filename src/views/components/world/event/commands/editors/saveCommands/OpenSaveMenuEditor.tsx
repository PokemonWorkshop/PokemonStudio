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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const OpenSaveMenuEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ event }, ref) => {
  const { t } = useTranslation();

  useEditorHandlingClose(ref);
  return (
    <Editor type="edit" title={t(`event_command_open_save_menu`)}>
      <InputFormContainer>
        <Info>{t(`event_command_no_parameters`)}</Info>
      </InputFormContainer>
    </Editor>
  );
});

OpenSaveMenuEditor.displayName = 'OpenSaveMenuEditor';
