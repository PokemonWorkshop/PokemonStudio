import React from 'react';
import styled from 'styled-components';
import { DataBlockWithTitleProps } from '@components/database/dataBlocks/DataBlockWithTitle';
import { useTranslation } from 'react-i18next';
import { DarkButton, DeleteButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer, TitleContainer } from '@components/editor/DataBlockEditorStyle';

type DashboardEditorButtonProps = {
  label: string;
  onClick: () => void;
};

export type DashboardEditorProps = Omit<DataBlockWithTitleProps, 'size'> & {
  editorTitle: string;
  onClickDelete?: () => void;
  importation?: DashboardEditorButtonProps;
  add?: DashboardEditorButtonProps;
  disabledDeletion?: boolean;
  disabledImport?: boolean;
};

const DashboardEditorContainer = styled(DataBlockEditorContainer)`
  width: calc(${({ theme, size }) => theme.sizes[size].middle}%);
  margin: 0;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;
`;

const DashboardTitleContainer = styled(TitleContainer)`
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
`;

const DashboardDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DashboardEditor = ({
  editorTitle,
  title,
  children,
  disabled,
  onClickDelete,
  importation,
  add,
  disabledDeletion,
  disabledImport,
}: DashboardEditorProps) => {
  const { t } = useTranslation('editor');

  return (
    <DashboardEditorContainer size="dashboard" data-disabled={disabled && 'true'} data-noactive>
      <DashboardTitleContainer>
        <p>{editorTitle}</p>
        <h3>{title}</h3>
      </DashboardTitleContainer>
      <DashboardDataContainer>{children}</DashboardDataContainer>
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
              <SecondaryButtonWithPlusIconResponsive onClick={add.onClick} tooltip={{ right: '100%', top: '100%' }}>
                {add.label}
              </SecondaryButtonWithPlusIconResponsive>
            )}
          </ButtonRightContainer>
        </ButtonContainer>
      )}
    </DashboardEditorContainer>
  );
};
