import React, { useState } from 'react';
import styled from 'styled-components';
import { DataBlockWithTitleProps } from '@components/database/dataBlocks/DataBlockWithTitle';
import { useTranslation } from 'react-i18next';
import { DarkButton, DeleteButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer, TitleContainer } from '@components/editor/DataBlockEditorStyle';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';

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
  canCollapse?: true;
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

type PageHeaderContainerProps = {
  isCollapse: boolean;
};

const PageHeaderContainer = styled(TitleContainer)<PageHeaderContainerProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  ${({ theme, isCollapse }) => !isCollapse && `border-bottom: 1px solid ${theme.colors.dark20}; padding-bottom: 16px;`};
`;

const PageDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ArrowStyle = styled.div`
  padding: 8px;
  color: ${({ theme }) => theme.colors.text400};
  cursor: pointer;
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
  canCollapse,
}: PageEditorProps) => {
  const { t } = useTranslation('editor');
  const [collapse, setCollapse] = useState(false);
  const onClickedCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <PageEditorContainer size="default" data-disabled={disabled && 'true'} data-noactive>
      <PageHeaderContainer isCollapse={collapse}>
        <TitleContainer>
          <p>{editorTitle}</p>
          <h3>{title}</h3>
        </TitleContainer>
        {canCollapse && <ArrowStyle onClick={onClickedCollapse}>{collapse ? <UpIcon /> : <DownIcon />}</ArrowStyle>}
      </PageHeaderContainer>
      {!collapse && (
        <>
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
                  <SecondaryButtonWithPlusIconResponsive onClick={add.onClick} data-tooltip-responsive={add.label}>
                    {add.label}
                  </SecondaryButtonWithPlusIconResponsive>
                )}
              </ButtonRightContainer>
            </ButtonContainer>
          )}
        </>
      )}
    </PageEditorContainer>
  );
};
