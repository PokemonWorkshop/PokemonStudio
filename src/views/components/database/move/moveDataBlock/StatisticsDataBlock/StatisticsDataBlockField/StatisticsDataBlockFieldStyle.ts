import styled from 'styled-components';

export const StatisticsDataBlockFieldStyle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
  justify-content: space-between;

  span {
    font-size: 14px;
    &:nth-child(1) {
      min-width: 75px;
      user-select: none;
      color: ${(props) => props.theme.colors.text400};
    }

    &:nth-child(2) {
      font-weight: 500;
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
