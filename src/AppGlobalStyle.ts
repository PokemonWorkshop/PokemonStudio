import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    position: relative;
    color: ${(props) => props.theme.colors.text100};
    height: 100vh;
    background: ${(props) => props.theme.colors.dark12};
    font-family: Avenir Next;
    overflow: hidden;
    margin: 0;

    #root {
      display: grid;
      grid-template-columns: fit-content(72px) auto;
      grid-template-rows: ${({ theme }) => theme.calc.height};

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

  .notifications-component {
    position: fixed;
    z-index: 9000;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }

  .notification-container--bottom-right {
    min-width: 400px;
    position: absolute;
    pointer-events: all;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .notification {
      min-width: 400px;
      width: unset !important;
      margin-left: auto;
    }
  }

  .cet-titlebar {
    height: 24px !important;
  }

  .cet-controls-container {
    height: 24px !important;
    align-items: center;

    .cet-icon {
      display: flex;
      justify-content: center;
      padding: 7px 0 7px 0;

      svg {
        fill: ${({ theme }) => theme.colors.text100} !important;
      }

      :hover {
        background-color: ${({ theme }) => theme.colors.dark22} !important;
      }

      :active {
        background-color: ${({ theme }) => theme.colors.dark24} !important;
      }
    }
  }

  .cet-titlebar.cet-windows, .cet-titlebar.cet-linux {
    line-height: 24px !important;

    .resizer {
      display: none;
    }
  }

  .cet-window-title {
    ${(props) => props.theme.fonts.titlesStudio};
    color: ${(props) => props.theme.colors.text500};
    font-size: 10px;
    line-height: 12px;
    padding-left: 4px;
  }

  .cet-container {
    top: 26px !important;
  }

  .react-flow__attribution {
    display: none;
  }
`;

export default GlobalStyle;
