import styled from 'styled-components';

export const DataInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  & p {
    margin: 0;
    font-size: 14px;
    color: ${(props) => props.theme.colors.text100};
  }
`;

export const DataInfoContainerHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  gap: 8px;
`;

export const DataInfoContainerHeaderTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12px;

  & span.data-id {
    color: ${(props) => props.theme.colors.text400};
    font-family: 'Avenir Next';
    font-size: 20px;
    font-weight: 400;
    margin-left: 12px;
    letter-spacing: normal;
  }
`;

export const DataInfoContainerHeaderBadges = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;
