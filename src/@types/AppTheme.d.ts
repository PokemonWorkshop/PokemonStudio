import 'styled-components';

interface Colors {
  primaryBase: string;
  primaryHover: string;
  primarySoft: string;
  secondaryHover: string;

  dangerBase: string;
  dangerHover: string;
  dangerSoft: string;

  infoBase: string;
  infoHover: string;
  infoSoft: string;

  warningBase: string;
  warningHover: string;
  warningSoft: string;

  successBase: string;
  successHover: string;
  successSoft: string;

  navigationTopIconColor: string;
  navigationIconColor: string;
  navigationIconCloseColor: string;

  overlay: string;
  dark8: string;
  dark12: string;
  dark14: string;
  dark15: string;
  dark16: string;
  dark18: string;
  dark19: string;
  dark20: string;
  dark22: string;
  dark23: string;
  dark24: string;

  text100: string;
  text400: string;
  text500: string;
  text600: string;
  text700: string;

  silverDark6: string;
  silverDark9: string;
  silverDark11: string;

  goldDark6: string;
  goldDark9: string;
  goldDark11: string;

  bronzeDark6: string;
  bronzeDark9: string;
  bronzeDark11: string;

  topazDark6: string;
  topazDark9: string;
  topazDark11: string;

  vermillionDark6: string;
  vermillionDark9: string;
  vermillionDark11: string;

  magentaDark6: string;
  magentaDark9: string;
  magentaDark11: string;

  amethystDark6: string;
  amethystDark9: string;
  amethystDark11: string;

  lavenderDark6: string;
  lavenderDark9: string;
  lavenderDark11: string;

  cobaltDark6: string;
  cobaltDark9: string;
  cobaltDark11: string;

  ceruleanDark6: string;
  ceruleanDark9: string;
  ceruleanDark11: string;

  cyanDark6: string;
  cyanDark9: string;
  cyanDark11: string;

  celadonDark6: string;
  celadonDark9: string;
  celadonDark11: string;

  peridotDark6: string;
  peridotDark9: string;
  peridotDark11: string;

  oliveDark6: string;
  oliveDark9: string;
  oliveDark11: string;

  emeraldDark6: string;
  emeraldDark9: string;
  emeraldDark11: string;
}

interface Fonts {
  titlesStudio: string;
  titlesHeadline1: string;
  titlesHeadline4: string;
  titlesHeadline6: string;
  titlesOverline: string;
  normalRegular: string;
  normalMedium: string;
  normalSmall: string;
  codeRegular: string;
  windowsIcons: string;
}

interface Breakpoints {
  smallScreen: string;
  dataBox422: string;
}

interface Size {
  min: number;
  max: number;
  middle: number;
}
interface Sizes {
  full: Size;
  half: Size;
  fourth: Size;
  default: Size;
}

interface Calc {
  height: string;
  titleBarHeight: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: Colors;
    fonts: Fonts;
    breakpoints: Breakpoints;
    sizes: Sizes;
    calc: Calc;
  }
}
