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
  dashboard: Size;
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
