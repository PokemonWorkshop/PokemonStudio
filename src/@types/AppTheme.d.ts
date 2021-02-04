import 'styled-components';

interface Colors {
  darkGrey: string;
  mediumGrey: string;
  lightGrey: string;
  lightYellow: string;
  darkYellow: string;
  lightRed: string;
  darkRed: string;
  lightGreen: string;
  darkGreen: string;
  textColor: string;

  primaryBase: string;
  primarySoft: string;

  dangerBase: string;
  dangerSoft: string;

  navigationTopIconColor: string;
  navigationIconColor: string;

  typeNormalBase: string;
  typeNormalSoft: string;

  typeFireBase: string;
  typeFireSoft: string;

  typeGrassBase: string;
  typeGrassSoft: string;

  typeWaterBase: string;
  typeWaterSoft: string;

  typeElectricBase: string;
  typeElectricSoft: string;

  typeIceBase: string;
  typeIceSoft: string;

  typeFightingBase: string;
  typeFightingSoft: string;

  typePoisonBase: string;
  typePoisonSoft: string;

  typeGroundBase: string;
  typeGroundSoft: string;

  typeFlyingBase: string;
  typeFlyingSoft: string;

  typePsychicBase: string;
  typePsychicSoft: string;

  typeBugBase: string;
  typeBugSoft: string;

  typeRockBase: string;
  typeRockSoft: string;

  typeGhostBase: string;
  typeGhostSoft: string;

  typeDarkBase: string;
  typeDarkSoft: string;

  typeDragonBase: string;
  typeDragonSoft: string;

  typeSteelBase: string;
  typeSteelSoft: string;

  typeFairyBase: string;
  typeFairySoft: string;

  typePhysicalBase: string;
  typePhysicalSoft: string;

  typeSpecialBase: string;
  typeSpecialSoft: string;

  typeStatusBase: string;
  typeStatusSoft: string;

  typeBallBase: string;
  typeBallSoft: string;

  typeHealBase: string;
  typeHealSoft: string;

  typeRepelBase: string;
  typeRepelSoft: string;

  typeFleeingBase: string;
  typeFleeingSoft: string;

  typeEventBase: string;
  typeEventSoft: string;

  typeStoneBase: string;
  typeStoneSoft: string;

  typeTechBase: string;
  typeTechSoft: string;

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
}

interface Fonts {
  titlesStudio: string;
  titlesHeadline1: string;
  titlesHeadline6: string;
  titlesOverline: string;
  normalRegular: string;
  normalMedium: string;
  normalSmall: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: Colors;
    fonts: Fonts;
  }
}
