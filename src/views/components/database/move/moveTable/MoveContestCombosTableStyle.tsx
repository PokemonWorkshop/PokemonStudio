import { DataGrid } from '@components/database/dataBlocks';
import styled from 'styled-components';

export const DataCombosTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header:first-child {
    padding: 0 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark14};
  }
`;

export const TableEmpty = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

export const DataCombosGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 140px 88px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }
`;
