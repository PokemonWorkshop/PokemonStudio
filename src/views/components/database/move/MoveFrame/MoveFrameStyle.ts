import styled from 'styled-components';

export const MoveFrameStyle = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 24px;
  width: 1024px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colors.dark20};
  border-radius: 12px;
  gap: 24px;

  #move-info {
    display: flex;
    flex-direction: column;
    gap: 24px;

    #info-head {
      display: flex;
      flex-direction: column;
      gap: 8px 0px;

      #info-types {
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
      }
    }
    #info-description {
      margin: 0;
      font-size: 14px;
      color: ${(props) => props.theme.colors.text100};
    }
  }
`;
