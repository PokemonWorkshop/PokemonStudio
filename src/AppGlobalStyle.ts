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

  .react-flow__attribution {
    &:before {
      content: 'powered by '
    }
    margin-right: 52px;
    margin-bottom: 16px;
    background-color: transparent;
    color: ${(props) => props.theme.colors.text600};
    font-size: 12px;
    font-weight: 600;
  }

  .react-flow__controls {
    bottom: 16px;
    right: 16px;
    left: auto;
    background: ${({ theme }) => theme.colors.dark16};
    border-radius: 4px;
  }

  .react-flow__controls-button {
    background: ${({ theme }) => theme.colors.dark16};
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark16};
    border-radius: 4px;

    :hover {
      background: ${({ theme }) => theme.colors.dark18};

      & svg {
        fill: ${({ theme }) => theme.colors.text100};
      }
    }

    & svg {
      fill: ${({ theme }) => theme.colors.text400};
    }
  }
`;

export default GlobalStyle;
