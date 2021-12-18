import styled from 'styled-components';

export const InputWithCoordinateLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  & div.coordinates {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }
`;
