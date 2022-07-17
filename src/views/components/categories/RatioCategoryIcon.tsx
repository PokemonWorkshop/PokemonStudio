import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CategoryIcon } from './CategoryIcon';

import { ReactComponent as NeutralIcon } from '@assets/icons/ratios/neutral.svg';
import { ReactComponent as ResistanceIcon } from '@assets/icons/ratios/resistance.svg';
import { ReactComponent as EffectiveIcon } from '@assets/icons/ratios/effective.svg';
import { ReactComponent as ImmuneIcon } from '@assets/icons/ratios/immune.svg';

import TypeModel from '@modelEntities/type/Type.model';
import { assertUnreachable } from '@utils/assertUnreachable';

type RatioCategoryIconProps = {
  offensiveType: TypeModel;
  defensiveType: TypeModel;
  allTypes: TypeModel[];
  editType: (type: TypeModel) => void;
  setHoveredDefensiveType: (value: string) => void;
  ratio?: string;
};

type RatioCategoryIconStyleProps = Omit<RatioCategoryIconProps, 'allTypes' | 'editType' | 'setHoveredDefensiveType'>;

const RatioCategoryIconStyle = styled(CategoryIcon).attrs<RatioCategoryIconStyleProps>((props) => ({
  'data-ratio': props.ratio,
}))<RatioCategoryIconStyleProps>`
  cursor: pointer;

  &[data-ratio='neutral'] {
    color: ${({ theme }) => theme.colors.text600};
    background-color: ${({ theme }) => theme.colors.dark18};

    &:hover {
      background-color: ${({ theme }) => theme.colors.dark20};
      border: 1px solid ${({ theme }) => theme.colors.text700};
    }

    &:active {
      color: ${({ theme }) => theme.colors.text500};
      background-color: ${({ theme }) => theme.colors.dark20};
      border: 1px solid ${({ theme }) => theme.colors.text400};
    }
  }

  &[data-ratio='low_efficience'] {
    color: ${({ theme }) => theme.colors.infoBase};
    background-color: ${({ theme }) => theme.colors.infoSoft};

    &:hover {
      background-color: ${({ theme }) => theme.colors.infoHover};
    }

    &:active {
      background-color: ${({ theme }) => theme.colors.infoHover};
      border: 1px solid ${({ theme }) => theme.colors.infoBase};
    }
  }

  &[data-ratio='high_efficience'] {
    color: ${({ theme }) => theme.colors.dangerBase};
    background-color: ${({ theme }) => theme.colors.dangerSoft};

    &:hover {
      background-color: ${({ theme }) => theme.colors.dangerHover};
    }

    &:active {
      background-color: ${({ theme }) => theme.colors.dangerHover};
      border: 1px solid ${({ theme }) => theme.colors.dangerBase};
    }
  }

  &[data-ratio='zero_efficience'] {
    color: ${({ theme }) => theme.colors.text400};
    background-color: ${({ theme }) => theme.colors.dark22};

    &:hover {
      background-color: ${({ theme }) => theme.colors.dark23};
      border: 1px solid ${({ theme }) => theme.colors.text600};
    }

    &:active {
      color: ${({ theme }) => theme.colors.text100};
      background-color: ${({ theme }) => theme.colors.dark23};
      border: 1px solid ${({ theme }) => theme.colors.text400};
    }
  }
`;

const renderSVGIcon = (ratio: string) => {
  switch (ratio) {
    case 'low_efficience':
      return <ResistanceIcon />;
    case 'high_efficience':
      return <EffectiveIcon />;
    case 'zero_efficience':
      return <ImmuneIcon />;
    default:
      return <NeutralIcon />;
  }
};

const getRatio = (offensiveType: TypeModel, defensiveType: TypeModel, allTypes: TypeModel[]) => {
  const { high, low, zero } = offensiveType.getEfficiencies(allTypes);
  if (high.includes(defensiveType)) return 'high_efficience';
  if (low.includes(defensiveType)) return 'low_efficience';
  if (zero.includes(defensiveType)) return 'zero_efficience';
  return 'neutral';
};

export const RatioCategoryIcon = ({ offensiveType, defensiveType, allTypes, editType, setHoveredDefensiveType }: RatioCategoryIconProps) => {
  const ratio = useMemo(() => getRatio(offensiveType, defensiveType, allTypes), [offensiveType, defensiveType, allTypes]);

  const leftClick = () => {
    // left-click-cycle
    const offType = offensiveType.clone();
    const damages = offType.damageTo;
    const neutral = damages.filter((damage) => damage.defensiveType === defensiveType.dbSymbol).length === 0;
    if (neutral) {
      damages.push({ defensiveType: defensiveType.dbSymbol, factor: 2.0 });
    } else {
      const damageTo = damages.find((damage) => damage.defensiveType === defensiveType.dbSymbol);
      switch (damageTo?.factor) {
        case 2.0:
          damageTo.factor = 0;
          break;
        case 0:
          damageTo.factor = 0.5;
          break;
        case 0.5:
          damages.splice(damages.indexOf(damageTo), 1);
          break;
        default:
          assertUnreachable(damageTo as never);
      }
    }
    editType(offType);
  };

  const rightClick = () => {
    // right-click-cycle
    const offType = offensiveType.clone();
    const damages = offType.damageTo;
    const neutral = damages.filter((damage) => damage.defensiveType === defensiveType.dbSymbol).length === 0;
    if (neutral) {
      damages.push({ defensiveType: defensiveType.dbSymbol, factor: 0.5 });
    } else {
      const damageTo = damages.find((damage) => damage.defensiveType === defensiveType.dbSymbol);
      switch (damageTo?.factor) {
        case 0.5:
          damageTo.factor = 0;
          break;
        case 0:
          damageTo.factor = 2;
          break;
        case 2:
          damages.splice(damages.indexOf(damageTo), 1);
          break;
        default:
          assertUnreachable(damageTo as never);
      }
    }
    editType(offType);
  };

  return (
    <RatioCategoryIconStyle
      offensiveType={offensiveType}
      defensiveType={defensiveType}
      ratio={ratio}
      onClick={leftClick}
      onContextMenu={(e) => {
        e.preventDefault();
        rightClick();
      }}
      onMouseEnter={() => setHoveredDefensiveType(defensiveType.dbSymbol)}
    >
      {renderSVGIcon(ratio)}
    </RatioCategoryIconStyle>
  );
};
