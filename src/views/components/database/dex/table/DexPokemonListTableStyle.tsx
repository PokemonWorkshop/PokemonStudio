import { DataGrid } from '@components/database/dataBlocks';
import { List } from 'react-virtualized';
import styled from 'styled-components';

export const DataPokemonListTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header:first-child {
    padding: 12px 0 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
    border-top: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

export const TableEmpty = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

type DataCreatureGridProps = {
  dragOn: boolean;
};

export const DataPokemonGrid = styled(DataGrid).attrs<DataCreatureGridProps>((props) => ({
  'data-drag-off': !props.dragOn ? true : undefined,
}))<DataCreatureGridProps>`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 18px 58px 32px 172px 158px auto;
  align-items: center;

  &[data-drag-off] {
    &:hover:not(.header) {
      background-color: ${({ theme }) => theme.colors.dark18};
      color: ${({ theme }) => theme.colors.text100};
      border-radius: 8px;
    }
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 58px 32px 102px auto;

    span:nth-child(5) {
      display: none;
    }
  }
`;

type DataPokemonVirtualizedListContainerProps = {
  height: number;
};

export const DataPokemonVirtualizedListContainer = styled.div<DataPokemonVirtualizedListContainerProps>`
  width: calc(100% + 4px);
  height: ${({ height }) => height}px;
  margin: 0 -4px 0 -8px;
`;

export const PokemonList = styled(List)`
  padding-right: 4px;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin-bottom: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${({ theme }) => theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.colors.dark15};
    border-color: ${({ theme }) => theme.colors.text400};
  }
`;
