import styled from 'styled-components';

import { DataBlockContainer } from '@components/database/dataBlocks';

export const TypeTableContainer = styled(DataBlockContainer)`
  width: calc(${({ theme, size }) => theme.sizes[size].middle}%);
  margin: 0;
  background-color: ${({ theme }) => theme.colors.dark16};
  gap: 0px;
`;

export const TypeTableBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TypeTableRowContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  column-gap: 16px;
  row-gap: 8px;
`;

export const TypeTableHeadContainer = styled(TypeTableRowContainer)`
  margin-bottom: 16px;
`;

export const TypeTableHeadTitleContainer = styled.span`
  width: 96px;
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${(props) => props.theme.colors.text400};
  margin-bottom: -4px;
  margin-top: auto;
  text-align: center;
  flex-shrink: 0;
`;

export const TypeIconListContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  column-gap: 8px;
  row-gap: 8px;
`;

export const TableTypeContainer = styled.div`
  overflow-x: auto;
  max-width: calc(100vw - 400px);

  padding-bottom: 8px;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin: 4px 0;
  }

  ::-webkit-scrollbar-corner {
    background-color: ${(props) => props.theme.colors.dark12};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.dark15};
    border: 1px solid ${(props) => props.theme.colors.text400};
  }
`;
