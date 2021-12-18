import React, { useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { DataBlockWithTitleProps } from '@components/database/dataBlocks/DataBlockWithTitle';
import { useTranslation } from 'react-i18next';
import { DarkButton, DeleteButtonWithIcon, SecondaryButtonWithPlusIconResponsive } from '@components/buttons';
import { ButtonContainer, ButtonRightContainer, DataBlockEditorContainer, TitleContainer } from './DataBlockEditorStyle';

type DataBlockCollapseEditorButtonProps = {
  label: string;
  onClick: () => void;
};

export type DataBlockCollapseEditorProps = {
  editorTitle: 'edit' | 'infos';
  onClickDelete: () => void;
  importation: DataBlockCollapseEditorButtonProps;
  add: DataBlockCollapseEditorButtonProps;
  disabledDeletion?: boolean;
  disabledImport?: boolean;
  disabledAdd?: boolean;
} & DataBlockWithTitleProps;

const DataBlockCollapseEditorContainer = styled(DataBlockEditorContainer)`
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;
`;

const WrapContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ArrowContainer = styled.div`
  padding: 8px;
  color: ${({ theme }) => theme.colors.text400};
`;

export const DataBlockCollapseEditor = ({
  editorTitle,
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
}: DataBlockCollapseEditorProps) => {
  const { t } = useTranslation(['editor']);
  const [collapse, setCollapse] = useState(false);
  const onClickedCollapse = () => {
    if (!disabled) setCollapse(!collapse);
  };

  return (
    <DataBlockCollapseEditorContainer size={size} data-disabled={disabled && 'true'} data-noactive>
      <WrapContainer onClick={onClickedCollapse}>
        <TitleContainer>
          {collapse ? <p>{t(`editor:${editorTitle}`)}</p> : <></>}
          <h3>{title}</h3>
        </TitleContainer>
        {!disabled && <ArrowContainer>{collapse ? <UpIcon /> : <DownIcon />}</ArrowContainer>}
      </WrapContainer>
      {collapse && children}
      {collapse && (
        <ButtonContainer>
          <DeleteButtonWithIcon onClick={onClickDelete} disabled={disabledDeletion || false}>
            {t('editor:all_delete')}
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
      )}
    </DataBlockCollapseEditorContainer>
  );
};
