import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

body {
    position: relative;
    color: ${(props) => props.theme.colors.textColor};
    height: 100vh;
    background: ${(props) => props.theme.colors.dark12};
    font-family: Avenir Next, sans-serif;
    overflow: hidden;
    margin: 0;

    #root {
      display: grid;
      grid-template-columns: 72px auto;
      grid-template-rows: 100vh;

      h1 {
        margin: 0;
        ${(props) => props.theme.fonts.titlesHeadline1}
        color: ${(props) => props.theme.colors.text100}
      }

      h2 {
        margin-top: 0;
        ${(props) => props.theme.fonts.titlesHeadline6}
        color: ${(props) => props.theme.colors.text400};
      }

      .pageContainer {
        padding: 0 32px;
      }
    }
  }
`;

export default GlobalStyle;
