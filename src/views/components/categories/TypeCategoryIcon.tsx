import React from 'react';
import { hexToColor } from '@utils/ColorUtils';
import { useProjectTypes } from '@utils/useProjectData';
import styled from 'styled-components';
import { CategoryIcon } from './CategoryIcon';

import { ReactComponent as NormalIcon } from '@assets/icons/types/normal.svg';
import { ReactComponent as FireIcon } from '@assets/icons/types/fire.svg';
import { ReactComponent as GrassIcon } from '@assets/icons/types/grass.svg';
import { ReactComponent as WaterIcon } from '@assets/icons/types/water.svg';
import { ReactComponent as ElectricIcon } from '@assets/icons/types/electric.svg';
import { ReactComponent as IceIcon } from '@assets/icons/types/ice.svg';
import { ReactComponent as FightingIcon } from '@assets/icons/types/fighting.svg';
import { ReactComponent as PoisonIcon } from '@assets/icons/types/poison.svg';
import { ReactComponent as GroundIcon } from '@assets/icons/types/ground.svg';
import { ReactComponent as FlyingIcon } from '@assets/icons/types/flying.svg';
import { ReactComponent as PsychicIcon } from '@assets/icons/types/psychic.svg';
import { ReactComponent as BugIcon } from '@assets/icons/types/bug.svg';
import { ReactComponent as RockIcon } from '@assets/icons/types/rock.svg';
import { ReactComponent as GhostIcon } from '@assets/icons/types/ghost.svg';
import { ReactComponent as DarkIcon } from '@assets/icons/types/dark.svg';
import { ReactComponent as DragonIcon } from '@assets/icons/types/dragon.svg';
import { ReactComponent as SteelIcon } from '@assets/icons/types/steel.svg';
import { ReactComponent as FairyIcon } from '@assets/icons/types/fairy.svg';

type TypeCategoryIconProps = {
  type: string;
  className?: string;
};

const hexToRgba = (type: string, alpha: number) => {
  if (!type || !type.startsWith('#')) return `rgba(195, 181, 178, ${alpha})`;
  const color = hexToColor(type);
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
};

const TypeCategoryIconStyle = styled(CategoryIcon).attrs<TypeCategoryIconProps>((props) => ({
  'data-type': props.type,
}))<TypeCategoryIconProps>`
  &.hovered-defensive-type {
    box-shadow: 0px 0px 0px 2px ${({ theme }) => theme.colors.primaryHover};
  }

  &[data-type='normal'] {
    background: rgba(196, 181, 178, 0.12);
    color: rgba(196, 181, 178, 1);
  }

  &[data-type='fire'] {
    background: rgba(238, 148, 116, 0.12);
    color: rgba(238, 148, 116, 1);
  }

  &[data-type='grass'] {
    background: rgba(37, 203, 44, 0.12);
    color: rgba(37, 203, 44, 1);
  }

  &[data-type='water'] {
    background: rgba(69, 150, 237, 0.12);
    color: rgba(69, 150, 237, 1);
  }

  &[data-type='electric'] {
    background: rgba(245, 171, 61, 0.12);
    color: rgba(245, 171, 61, 1);
  }

  &[data-type='ice'] {
    background: rgba(81, 196, 200, 0.12);
    color: rgba(81, 196, 200, 1);
  }

  &[data-type='fighting'] {
    background: rgba(234, 131, 131, 0.12);
    color: rgba(234, 131, 131, 1);
  }

  &[data-type='poison'] {
    background: rgba(178, 146, 247, 0.12);
    color: rgba(178, 146, 247, 1);
  }

  &[data-type='ground'] {
    background: rgba(201, 148, 87, 0.12);
    color: rgba(201, 148, 87, 1);
  }

  &[data-type='flying'] {
    background: rgba(131, 175, 241, 0.12);
    color: rgba(131, 175, 241, 1);
  }

  &[data-type='psychic'] {
    background: rgba(221, 125, 180, 0.12);
    color: rgba(221, 125, 180, 1);
  }

  &[data-type='bug'] {
    background: rgba(155, 195, 55, 0.12);
    color: rgba(155, 195, 55, 1);
  }

  &[data-type='rock'] {
    background: rgba(203, 139, 62, 0.12);
    color: rgba(203, 139, 62, 1);
  }

  &[data-type='ghost'] {
    background: rgba(155, 150, 237, 0.12);
    color: rgba(155, 150, 237, 1);
  }

  &[data-type='dark'] {
    background: rgba(167, 172, 190, 0.12);
    color: rgba(167, 172, 190, 1);
  }

  &[data-type='dragon'] {
    background: rgba(124, 136, 243, 0.12);
    color: rgba(124, 136, 243, 1);
  }

  &[data-type='steel'] {
    background: rgba(194, 198, 209, 0.12);
    color: rgba(194, 198, 209, 1);
  }

  &[data-type='fairy'] {
    background: rgba(233, 129, 164, 0.12);
    color: rgba(233, 129, 164, 1);
  }

  &[data-type*='#'] {
    background: ${({ type }) => hexToRgba(type, 0.12)};
    color: ${({ type }) => hexToRgba(type, 1)};
  }
`;

const renderSVGIcon = (type: string) => {
  switch (type) {
    case 'normal':
      return <NormalIcon />;
    case 'fire':
      return <FireIcon />;
    case 'grass':
      return <GrassIcon />;
    case 'water':
      return <WaterIcon />;
    case 'electric':
      return <ElectricIcon />;
    case 'ice':
      return <IceIcon />;
    case 'fighting':
      return <FightingIcon />;
    case 'poison':
      return <PoisonIcon />;
    case 'ground':
      return <GroundIcon />;
    case 'flying':
      return <FlyingIcon />;
    case 'psychic':
      return <PsychicIcon />;
    case 'bug':
      return <BugIcon />;
    case 'rock':
      return <RockIcon />;
    case 'ghost':
      return <GhostIcon />;
    case 'dark':
      return <DarkIcon />;
    case 'dragon':
      return <DragonIcon />;
    case 'steel':
      return <SteelIcon />;
    case 'fairy':
      return <FairyIcon />;
    default:
      return <NormalIcon />;
  }
};

export const TypeCategoryIcon = ({ type, className }: TypeCategoryIconProps) => {
  const { projectDataValues: types } = useProjectTypes();
  const currentType = types[type];
  return (
    <TypeCategoryIconStyle type={currentType ? currentType.getColor() : 'normal'} className={className}>
      {renderSVGIcon(type)}
    </TypeCategoryIconStyle>
  );
};

// TypeCategoryIconPreview (future feature?)
