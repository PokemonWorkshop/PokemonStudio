import React from 'react';
import styled from 'styled-components';
import { DataBlockWithTitleProps } from '@components/database/dataBlocks/DataBlockWithTitle';
import { DataBlockEditorContainer } from './DataBlockEditorStyle';

export type MovePoolEditorProps = {
  disabled?: boolean;
} & DataBlockWithTitleProps;

const MovepoolEditorContainer = styled(DataBlockEditorContainer)`
  background-color: ${({ theme }) => theme.colors.dark16};
  border: none;
  width: 100%;
  margin: 0;
`;

export const DataBlockMovePoolEditor = ({ size, children, disabled }: MovePoolEditorProps) => {
  return (
    <MovepoolEditorContainer size={size} data-disabled={disabled && 'true'} data-noactive>
      {children}
    </MovepoolEditorContainer>
  );
};
