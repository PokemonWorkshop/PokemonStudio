import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTextPage } from '@hooks/usePage';
import styled from 'styled-components';
import { SelectText } from '@components/selects';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useImportProjectText } from '@utils/ReadingProjectText';
import { TooltipWrapper } from '@ds/Tooltip';

const ImportInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type Props = {
  closeDialog: () => void;
};

/**
 * Text Import Editor.
 * Component that is mainly responsive of importing the texts file when we click on the button "Import texts"
 */
export const TextImportEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog }, ref) => {
  const { textInfo } = useTextPage();
  const setImportProjectText = useImportProjectText();
  const { t } = useTranslation('text_management');
  const [textSelected, setTextSelected] = useState('__undef__');

  useEditorHandlingClose(ref);

  const onClickImport = () => {
    setImportProjectText(Number(textSelected), textInfo.fileId);
    closeDialog();
  };

  const checkDisabled = () => textSelected === '__undef__';

  return (
    <Editor type="text" title={t('importation')}>
      <InputContainer>
        <ImportInfoContainer>{t('importation_info')}</ImportInfoContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="import" required>
            {t('import_texts_file')}
          </Label>
          <SelectText fileId={textSelected} onChange={(selected) => setTextSelected(selected)} undefValueOption={t('none')} noLabel />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickImport} disabled={checkDisabled()}>
              {t('import')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
TextImportEditor.displayName = 'TextImportEditor';
