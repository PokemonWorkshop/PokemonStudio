import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockEditorContainer, TitleContainer } from './DataBlockEditorStyle';
import styled from 'styled-components';
import { DataBlockContainerColor, DataBlockCOntainerSize } from '@components/database/dataBlocks/DataBlockContainer';

type DataBlockWithoutActionButtonsEditorProps = {
  title: string;
  size: DataBlockCOntainerSize;
  children?: ReactNode;
  disabled?: boolean;
  color?: DataBlockContainerColor;
};

const DataBlockWithoutActionButtonsEditorContainer = styled(DataBlockEditorContainer)`
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;
`;

export const DataBlockWithoutActionButtonsEditor = ({ title, size, children, disabled, color }: DataBlockWithoutActionButtonsEditorProps) => {
  const { t } = useTranslation();
  return (
    <DataBlockWithoutActionButtonsEditorContainer size={size} color={color} data-disabled={disabled && 'true'} data-noactive>
      <TitleContainer>
        <p>{t('edit')}</p>
        <h3>{title}</h3>
      </TitleContainer>
      {children}
    </DataBlockWithoutActionButtonsEditorContainer>
  );
};
