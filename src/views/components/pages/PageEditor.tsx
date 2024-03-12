import React from 'react';
import styled from 'styled-components';
import { DataBlockWithTitleProps } from '@components/database/dataBlocks/DataBlockWithTitle';
import { useTranslation } from 'react-i18next';
import { DarkButton, DeleteButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer, TitleContainer } from '@components/editor/DataBlockEditorStyle';

type PageEditorButtonProps = {
  label: string;
  onClick: () => void;
};

export type PageEditorProps = Omit<DataBlockWithTitleProps, 'size'> & {
  editorTitle: string;
  onClickDelete?: () => void;
  importation?: PageEditorButtonProps;
  add?: PageEditorButtonProps;
  disabledDeletion?: boolean;
  disabledImport?: boolean;
};

const PageEditorContainer = styled(DataBlockEditorContainer)`
  width: calc(${({ theme, size }) => theme.sizes[size].middle}%);
  margin: 0;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;

  ${ButtonContainer} {
    border-top: 1px solid ${({ theme }) => theme.colors.dark20};
  }
`;

const PageTitleContainer = styled(TitleContainer)`
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const PageDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PageEditor = ({
  editorTitle,
  title,
  children,
  disabled,
  onClickDelete,
  importation,
  add,
  disabledDeletion,
  disabledImport,
}: PageEditorProps) => {
  const { t } = useTranslation('editor');

  return (
    <PageEditorContainer size="default" data-disabled={disabled && 'true'} data-noactive>
      <PageTitleContainer>
        <p>{editorTitle}</p>
        <h3>{title}</h3>
      </PageTitleContainer>
      <PageDataContainer>{children}</PageDataContainer>
      {(onClickDelete || importation || add) && (
        <ButtonContainer>
          {onClickDelete ? (
            <DeleteButtonWithIcon onClick={onClickDelete} disabled={disabledDeletion || false}>
              {t('all_delete')}
            </DeleteButtonWithIcon>
          ) : (
            <div />
          )}
          <ButtonRightContainer>
            {importation && (
              <DarkButton onClick={importation.onClick} disabled={disabledImport || false}>
                {importation.label}
              </DarkButton>
            )}
            {add && (
              <SecondaryButtonWithPlusIconResponsive onClick={add.onClick} data-tooltip={add.label}>
                {add.label}
              </SecondaryButtonWithPlusIconResponsive>
            )}
          </ButtonRightContainer>
        </ButtonContainer>
      )}
    </PageEditorContainer>
  );
};
