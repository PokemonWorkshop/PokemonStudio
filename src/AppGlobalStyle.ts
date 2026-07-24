import { createGlobalStyle } from 'styled-components';
import '@xyflow/react/dist/style.css';

const GlobalStyle = createGlobalStyle`
  body {
    /* Mirrors theme.motion so plain CSS blocks can use the same curves. */
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
    --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
    --dur-press: 120ms;
    --dur-menu: 150ms;
    --dur-modal: 200ms;

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

  .rnc__base {
    position: fixed;
    z-index: 9000;
    pointer-events: none;
    width: 100%;
    height: 100%;
  }

  .rnc__notification-container--bottom-right {
    width: 480px;
    position: absolute;
    pointer-events: all;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .rnc__notification {
      width: 480px;
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
    user-select: none;
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

  #tooltipContainer {
    margin: 0;
    padding: 8px;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.dark8};
    color: ${({ theme }) => theme.colors.text100};
    ${({ theme }) => theme.fonts.normalMedium}
    max-width: 640px;
    border: none;
    opacity: 0;

    &.visible {
      opacity: 1;
    }
  }
`;

export default GlobalStyle;
