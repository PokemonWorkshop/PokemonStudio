import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EditorWithCollapse } from '@components/editor';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { FileInput, Input, InputContainer, InputWithTopLabelContainer, Label, MultiLineInput, PaddedInputContainer } from '@components/inputs';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { DropInput } from '@components/inputs/DropInput';
import { useTextInfos } from '@utils/useTextInfos';
import { TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { createTextInfo } from '@utils/entityCreation';
import { cloneEntity } from '@utils/cloneEntity';
import { useNewProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { useImportCsvFile } from '@utils/useImportCsvFile';
import { showNotification } from '@utils/showNotification';

type Props = {
  closeDialog: () => void;
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

/**
 * Dialog shown when user wants to create a new texts file
 */
export const TextNewEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog }, ref) => {
  const { t } = useTranslation('text_management');
  const { textInfosValues: textInfos, setTextInfosValues: setTextInfos } = useTextInfos();
  const setText = useSetProjectText();
  const setNewProjectText = useNewProjectText();
  const importCsvFile = useImportCsvFile();
  const [name, setName] = useState('');
  const [csvFilePath, setCsvFilePath] = useState<string | undefined>(undefined);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  /**
   * Create the new ability based on all provided information and jump to that ability
   */
  const onClickNew = () => {
    if (!name || !descriptionRef.current) return;

    const newTextInfo = createTextInfo(textInfos);
    const textInfosCloned = cloneEntity(textInfos);
    textInfosCloned.push(newTextInfo);

    if (csvFilePath === undefined) {
      setNewProjectText(newTextInfo.fileId);
      setText(TEXT_INFO_NAME_TEXT_ID, newTextInfo.textId, name);
      setText(TEXT_INFO_DESCRIPTION_TEXT_ID, newTextInfo.textId, descriptionRef.current.value);
      setTextInfos(textInfosCloned, { textInfo: newTextInfo.fileId });
      closeDialog();
    } else {
      importCsvFile(
        { filePath: csvFilePath, fileId: newTextInfo.fileId },
        () => {
          if (!descriptionRef.current) return;

          setText(TEXT_INFO_NAME_TEXT_ID, newTextInfo.textId, name);
          setText(TEXT_INFO_DESCRIPTION_TEXT_ID, newTextInfo.textId, descriptionRef.current.value);
          setTextInfos(textInfosCloned, { textInfo: newTextInfo.fileId });
          closeDialog();
        },
        (error) => showNotification('danger', '', error.errorMessage)
      );
    }
  };

  /**
   * Check if the entity cannot be created because of any validation error
   */
  const checkDisabled = () => !name;

  return (
    <EditorWithCollapse type="creation" title={t('texts_file')}>
      <InputContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="name" required>
              {t('name')}
            </Label>
            <Input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_name')} />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="descr">{t('description')}</Label>
            <MultiLineInput id="descr" ref={descriptionRef} placeholder={t('example_description')} />
          </InputWithTopLabelContainer>
        </PaddedInputContainer>
        <InputGroupCollapse title={t('other_data')} collapseByDefault noMargin>
          <InputWithTopLabelContainer>
            <Label htmlFor="import">{t('import_file')}</Label>
            {csvFilePath === undefined ? (
              <DropInput name={t('texts_file')} extensions={['csv']} onFileChoosen={(filePath) => setCsvFilePath(filePath)} showAcceptedFormat />
            ) : (
              <FileInput
                filePath={csvFilePath}
                name={t('texts_file')}
                extensions={['csv']}
                isAbsolutePath
                onFileChoosen={(filePath) => setCsvFilePath(filePath)}
                onFileClear={() => setCsvFilePath(undefined)}
              />
            )}
          </InputWithTopLabelContainer>
        </InputGroupCollapse>
        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_new_file')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
});
TextNewEditor.displayName = 'TextNewEditor';
