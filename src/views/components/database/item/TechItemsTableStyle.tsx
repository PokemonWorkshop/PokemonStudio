import styled from 'styled-components';
import { DataGrid } from '@components/database/dataBlocks';

export const DataTechItemTable = styled.div`
  display: flex;
  flex-direction: column;

  .header:first-child {
    padding: 0 0 12px 0;
    margin-bottom: 4px;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

export const DataTechItemGrid = styled(DataGrid)`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 60px 48px 280px 48px 75px 75px 49px 87px 82px auto 40px;
  align-items: center;

  &:hover:not(.header) {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};

    .edit {
      display: flex;
    }
  }

  & span:nth-child(7),
  & span:nth-child(8),
  & span:nth-child(9),
  & span:nth-child(10) {
    text-align: right;
  }

  & span:nth-child(11) {
    text-align: right;
    display: none;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    grid-template-columns: 43px 32px 240px 75px auto 40px;

    & span:nth-child(4),
    & span:nth-child(6),
    & span:nth-child(7),
    & span:nth-child(8),
    & span:nth-child(9) {
      display: none;
    }
  }
`;

export const RenderTechItemContainer = styled(DataTechItemGrid)`
  box-sizing: border-box;
  height: 48px;
  padding: 0 8px 0 8px;
  margin: 0 -8px 0 -8px;

  & .icon {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }

  .select span {
    text-align: left;
  }
`;

export const NoMoveFound = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text500};
`;
