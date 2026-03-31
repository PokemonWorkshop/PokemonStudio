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

    silverDark6: '#272c31',
    silverDark9: '#4a545d',
    silverDark11: '#63788e',

    goldDark6: '#2f2b25',
    goldDark9: '#595146',
    goldDark11: '#85735B',

    bronzeDark6: '#302A27',
    bronzeDark9: '#5C4F4A',
    bronzeDark11: '#8D7063',

    topazDark6: '#3D2416',
    topazDark9: '#7D3F17',
    topazDark11: '#BA5D1D',

    vermillionDark6: '#422018',
    vermillionDark9: '#88341F',
    vermillionDark11: '#CC4B2B',

    magentaDark6: '#3F1E35',
    magentaDark9: '#7D3168',
    magentaDark11: '#BD4A9D',

    amethystDark6: '#342147',
    amethystDark9: '#663693',
    amethystDark11: '#9559D0',

    lavenderDark6: '#2B244B',
    lavenderDark9: '#543D9E',
    lavenderDark11: '#7E61E0',

    cobaltDark6: '#1A294E',
    cobaltDark9: '#2B4C9F',
    cobaltDark11: '#4370E2',

    ceruleanDark6: '#082E49',
    ceruleanDark9: '#02578B',
    ceruleanDark11: '#087CC2',

    cyanDark6: '#04313C',
    cyanDark9: '#005C71',
    cyanDark11: '#0A819D',

    celadonDark6: '#073234',
    celadonDark9: '#005F5F',
    celadonDark11: '#00857F',

    peridotDark6: '#1A321B',
    peridotDark9: '#325F34',
    peridotDark11: '#458449',

    oliveDark6: '#233014',
    oliveDark9: '#435C26',
    oliveDark11: '#5D8035',
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
    default: {
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
