import styled from 'styled-components';

export const PageContainerStyle = styled.div`
  padding: 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  margin: 0 4px;

  @media screen and (max-width: 1366px) {
    display: block;
    margin: 0 auto;
    overflow-x: auto;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin: 4px 0;
  }

  ::-webkit-scrollbar-corner {
    background-color: ${(props) => props.theme.colors.dark12};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.dark15};
    border: 1px solid ${(props) => props.theme.colors.text400};
  }
`;
