import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CategoryIcon } from './CategoryIcon';

import { ReactComponent as NeutralIcon } from '@assets/icons/ratios/neutral.svg';
import { ReactComponent as ResistanceIcon } from '@assets/icons/ratios/resistance.svg';
import { ReactComponent as EffectiveIcon } from '@assets/icons/ratios/effective.svg';
import { ReactComponent as ImmuneIcon } from '@assets/icons/ratios/immune.svg';

import { assertUnreachable } from '@utils/assertUnreachable';
import { HelperSelectedType } from '@components/database/type/TypeHelper';
import { getEfficiency, StudioType } from '@modelEntities/type';
import { cloneEntity } from '@utils/cloneEntity';

type RatioCategoryIconProps = {
  offensiveType: StudioType;
  defensiveType: StudioType;
  allTypes: StudioType[];
  editType: (type: StudioType) => void;
  setHoveredDefensiveType: (value: string) => void;
  setTypeHelperSelected: (typeHelperSelected: HelperSelectedType) => void;
};

type RatioCategoryIconStyleProps = Omit<RatioCategoryIconProps, 'allTypes' | 'editType' | 'setHoveredDefensiveType' | 'setTypeHelperSelected'>;

const RatioCategoryIconStyle = styled(CategoryIcon).attrs<RatioCategoryIconStyleProps & { ratio: string }>((props) => ({
  'data-ratio': props.ratio,
}))<RatioCategoryIconStyleProps & { ratio: string }>`
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

export const RatioCategoryIcon = ({
  offensiveType,
  defensiveType,
  allTypes,
  editType,
  setHoveredDefensiveType,
  setTypeHelperSelected,
}: RatioCategoryIconProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ratio = useMemo(() => getEfficiency(offensiveType, defensiveType, allTypes), [offensiveType, defensiveType]);

  const leftClick = () => {
    // left-click-cycle
    const offType = cloneEntity(offensiveType);
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
    setTypeHelperSelected({ offensiveType: offType, defensiveType });
  };

  const rightClick = () => {
    // right-click-cycle
    const offType = cloneEntity(offensiveType);
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
    setTypeHelperSelected({ offensiveType: offType, defensiveType });
  };

  const onMouseEnter = (offType: StudioType, defType: StudioType) => {
    setHoveredDefensiveType(defType.dbSymbol);
    setTypeHelperSelected({ offensiveType: offType, defensiveType: defType });
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
      onMouseEnter={() => onMouseEnter(offensiveType, defensiveType)}
    >
      {renderSVGIcon(ratio)}
    </RatioCategoryIconStyle>
  );
};
