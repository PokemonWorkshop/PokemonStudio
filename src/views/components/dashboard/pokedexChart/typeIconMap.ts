import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import NormalIcon from '@assets/icons/types/normal.svg';
import FireIcon from '@assets/icons/types/fire.svg';
import GrassIcon from '@assets/icons/types/grass.svg';
import WaterIcon from '@assets/icons/types/water.svg';
import ElectricIcon from '@assets/icons/types/electric.svg';
import IceIcon from '@assets/icons/types/ice.svg';
import FightingIcon from '@assets/icons/types/fighting.svg';
import PoisonIcon from '@assets/icons/types/poison.svg';
import GroundIcon from '@assets/icons/types/ground.svg';
import FlyingIcon from '@assets/icons/types/flying.svg';
import PsychicIcon from '@assets/icons/types/psychic.svg';
import BugIcon from '@assets/icons/types/bug.svg';
import RockIcon from '@assets/icons/types/rock.svg';
import GhostIcon from '@assets/icons/types/ghost.svg';
import DarkIcon from '@assets/icons/types/dark.svg';
import DragonIcon from '@assets/icons/types/dragon.svg';
import SteelIcon from '@assets/icons/types/steel.svg';
import FairyIcon from '@assets/icons/types/fairy.svg';

export const TYPE_ICON_COMPONENTS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  normal: NormalIcon,
  fire: FireIcon,
  grass: GrassIcon,
  water: WaterIcon,
  electric: ElectricIcon,
  ice: IceIcon,
  fighting: FightingIcon,
  poison: PoisonIcon,
  ground: GroundIcon,
  flying: FlyingIcon,
  psychic: PsychicIcon,
  bug: BugIcon,
  rock: RockIcon,
  ghost: GhostIcon,
  dark: DarkIcon,
  dragon: DragonIcon,
  steel: SteelIcon,
  fairy: FairyIcon,
};

/** White Image objects derived from SVG components, for Chart.js canvas rendering */
export const chartIconImages: Record<string, HTMLImageElement> = {};
Object.entries(TYPE_ICON_COMPONENTS).forEach(([type, Icon]) => {
  const svgString = renderToStaticMarkup(React.createElement(Icon));
  const whiteSvg = svgString.replace(/currentColor/g, 'rgba(255,255,255,0.9)');
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(whiteSvg)}`;
  const img = new Image();
  img.src = uri;
  chartIconImages[type] = img;
});
