import { DarkButton, DeleteButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockCollapseEditorProps } from './DataBlockCollapseEditor';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer, TitleContainer } from './DataBlockEditorStyle';

type DataBlockEditorProps = Omit<DataBlockCollapseEditorProps, 'editorTitle'>;

export const DataBlockEditor = ({
  title,
  size,
  children,
  disabled,
  onClickDelete,
  importation,
  add,
  disabledDeletion,
  disabledImport,
  disabledAdd,
  color,
}: DataBlockEditorProps) => {
  const { t } = useTranslation('editor');
  return (
    <DataBlockEditorContainer size={size} color={color} data-disabled={disabled && 'true'} data-noactive>
      <TitleContainer>
        <h3>{title}</h3>
      </TitleContainer>
      {children}
      <ButtonContainer color={color}>
        <DeleteButtonWithIcon onClick={onClickDelete} disabled={disabledDeletion || false}>
          {t('all_delete')}
        </DeleteButtonWithIcon>
        <ButtonRightContainer>
          <DarkButton onClick={importation.onClick} disabled={disabledImport || false}>
            {importation.label}
          </DarkButton>
          <SecondaryButtonWithPlusIconResponsive onClick={add.onClick} tooltip={{ right: '100%', top: '100%' }} disabled={disabledAdd || false}>
            {add.label}
          </SecondaryButtonWithPlusIconResponsive>
        </ButtonRightContainer>
      </ButtonContainer>
    </DataBlockEditorContainer>
  );
};
