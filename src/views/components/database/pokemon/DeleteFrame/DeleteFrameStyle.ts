import styled from 'styled-components';

export const DeleteFrameStlye = styled.div`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 24px;
  width: 1024px;

  border: 1px solid;
  border-color: ${(props) => props.theme.colors.dark20};
  border-radius: 8px;

  justify-content: space-between;
  align-items: center;

  margin-bottom: 24px;

  h2 {
    margin: 0;
  }
`;
