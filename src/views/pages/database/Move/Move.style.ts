import styled from 'styled-components';

export const MovePageStyle = styled.div`
  display: grid;
  grid-template-rows: 64px auto;
  width: 100%;

  div#main-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  div#datablock-container {
    width: 1024px;
    display: flex;
    row-gap: 16px;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
  }
`;
