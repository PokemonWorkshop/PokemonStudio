// eslint-disable-next-line import/named
import { DefaultTheme } from 'styled-components';

/**
 * Application Global Theme
 */
const theme: DefaultTheme = {
  colors: {
    /* Button Styles */
    primaryBase: 'rgba(101, 98, 248, 1)',
    primaryHover: 'rgba(111, 109, 248, 1)',
    primarySoft: 'rgba(101, 98, 248, 0.12)',
    secondaryHover: 'rgba(111, 116, 246, 0.16)',

    dangerBase: 'rgba(245, 61, 92, 1)',
    dangerHover: 'rgba(243, 73, 107, 0.16)',
    dangerSoft: 'rgba(245, 61, 92, 0.12)',

    infoBase: 'rgba(53, 175, 243, 1)',
    infoHover: 'rgba(53, 175, 243, 0.16)',
    infoSoft: 'rgba(53, 175, 243, 0.12)',

    warningBase: 'rgba(245, 171, 61, 1)',
    warningHover: 'rgba(246, 180, 81, 1)',
    warningSoft: 'rgba(245, 171, 61, 0.12)',

    successBase: 'rgba(53, 221, 131, 1)',
    successHover: 'rgba(53, 221, 131, 0.16)',
    successSoft: 'rgba(53, 221, 131, 0.12)',

    navigationTopIconColor: '#f4f4f5',
    navigationIconColor: '#656572',
    navigationIconCloseColor: '#EC2D3A',

    overlay: 'rgba(145, 145, 161, 1)',
    dark8: 'rgba(19, 18, 22, 1)',
    dark12: 'rgba(29, 28, 34, 1)',
    dark14: 'rgba(34, 33, 39, 1)',
    dark15: 'rgba(36, 35, 41, 1)',
    dark16: 'rgba(38, 37, 44, 1)',
    dark18: 'rgba(43, 42, 50, 1)',
    dark19: 'rgba(45, 44, 53, 1)',
    dark20: 'rgba(48, 46, 56, 1)',
    dark22: 'rgba(53, 51, 61, 1)',
    dark23: 'rgba(55, 53, 64, 1)',
    dark24: 'rgba(58, 56, 67, 1)',

    text100: 'rgba(244, 244, 245, 1)',
    text400: 'rgba(145, 145, 161, 1)',
    text500: 'rgba(101, 101, 114, 1)',
    text600: 'rgba(75, 75, 88, 1)',
    text700: 'rgba(66, 66, 77, 1)',
  },
  fonts: {
    titlesStudio: `
      font-family: Gilroy;
      font-weight: 400;
      font-size: 48px;
      letter-spacing: 0.25px;
      line-height: 58px;`,
    titlesHeadline1: `
      font-family: Gilroy;
      font-weight: 600;
      font-size: 36px;
      letter-spacing: 0.25px;
      line-height: 43px;`,
    titlesHeadline4: `
      font-family: Gilroy;
      font-weight: 400;
      font-size: 24px;
      line-height: 29px;`,
    titlesHeadline6: `
      font-family: Gilroy;
      font-weight: 600;
      font-size: 18px;`,
    titlesOverline: `
      font-family: Avenir Next;
      font-weight: 600;
      font-size: 10px;`,
    normalRegular: `
      font-family: Avenir Next;
      font-weight: 400;
      font-size: 14px;`,
    normalMedium: `
      font-family: Avenir Next;
      font-weight: 500;
      font-size: 14px;`,
    normalSmall: `
      font-family: Avenir Next;
      font-weight: 400;
      font-size: 12px;`,
    codeRegular: `
      font-family: Source Code Pro;
      font-weight: 400;
      font-size: 14px;`,
    windowsIcons: `
      font-family: Segoe MDL2 Assets;
      font-weight: 400;
      font-size: 10px;`,
  },
  breakpoints: {
    smallScreen: 'screen and (max-width: 1366px)',
    dataBox422: 'screen and (max-width: 1393px)',
  },
  sizes: {
    full: {
      min: 244,
      max: 1024,
      middle: 100,
    },
    half: {
      min: 504,
      max: 504,
      middle: 50,
    },
    fourth: {
      min: 244,
      max: 504,
      middle: 25,
    },
    dashboard: {
      min: 504,
      max: 708,
      middle: 100,
    },
  },
  calc: {
    height: window.api.platform === 'win32' ? 'calc(100vh - 26px)' : '100vh',
    titleBarHeight: window.api.platform === 'win32' ? '26px' : '0',
  },
};

export default theme;
