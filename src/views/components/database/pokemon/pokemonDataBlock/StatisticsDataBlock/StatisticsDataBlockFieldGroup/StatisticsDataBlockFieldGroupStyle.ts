import styled from 'styled-components';

export const StatisticsDataBlockFieldGroupStyle = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    margin-top: 0;
    color: ${(props) => props.theme.colors.text400};
    font-size: 14px;
    font-weight: 600;
  }
`;
