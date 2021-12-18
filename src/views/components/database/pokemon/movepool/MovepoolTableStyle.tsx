import styled from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';

export const DataMoveTable = styled.div`
  display: flex;
  flex-direction: column;

  .header:first-child {
    padding: 0 0 12px 0;
    margin-bottom: 4px;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

export const DataMoveGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 280px 75px 75px 49px 87px 82px auto;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;

    .delete {
      display: flex;
    }
  }

  & span:nth-child(4),
  & span:nth-child(5),
  & span:nth-child(6) {
    text-align: right;
  }

  .delete:nth-child(7) {
    display: none;
    justify-content: end;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 256px 75px auto;

    & span:nth-child(3),
    & span:nth-child(4),
    & span:nth-child(5),
    & span:nth-child(6) {
      display: none;
    }
  }
`;

export const NoMoveFound = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;

export const RenderMoveContainer = styled(DataMoveGrid)`
  box-sizing: border-box;
  height: 48px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;
`;
