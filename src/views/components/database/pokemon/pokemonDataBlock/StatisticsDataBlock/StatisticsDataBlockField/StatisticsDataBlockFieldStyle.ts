import styled from 'styled-components';

export const StatisticsDataBlockFieldStyle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
  justify-content: space-between;
  margin-bottom: 8px;

  span {
    font-size: 14px;
    &:nth-child(1) {
      color: ${(props) => props.theme.colors.text400};
    }

    &:nth-child(2) {
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
