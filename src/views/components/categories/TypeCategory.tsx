import { hexToColor } from '@utils/ColorUtils';
import { useProjectTypes } from '@utils/useProjectData';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Category, CategoryLarge } from './Category';

type TypeCategoryProps = {
  type: string;
  children: ReactNode;
};

const hexToRgba = (type: string, alpha: number) => {
  if (!type || !type.startsWith('#')) return `rgba(195, 181, 178, ${alpha})`;
  const color = hexToColor(type);
  return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
};

const TypeCategoryStyle = styled(Category).attrs<TypeCategoryProps>((props) => ({
  'data-type': props.type,
}))<TypeCategoryProps>`
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

const TypeTableCategoryStyle = styled(CategoryLarge).attrs<TypeCategoryProps>((props) => ({
  'data-type': props.type,
}))<TypeCategoryProps>`
  flex-shrink: 0;

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

export const TypeCategory = ({ type, children }: TypeCategoryProps) => {
  const { projectDataValues: types } = useProjectTypes();
  const currentType = types[type];
  return <TypeCategoryStyle type={currentType ? currentType.color || currentType.dbSymbol : 'normal'}>{children}</TypeCategoryStyle>;
};

export const TypeCategoryPreview = ({ type, children }: TypeCategoryProps) => {
  return <TypeCategoryStyle type={type}>{children}</TypeCategoryStyle>;
};

export const TypeCategoryPokemonBattler = ({ type, children }: TypeCategoryProps) => {
  const { projectDataValues: types } = useProjectTypes();
  const currentType = types[type];
  return (
    <TypeCategoryStyle type={currentType ? currentType.color || currentType.dbSymbol : 'normal'} data-has-hover>
      {children}
    </TypeCategoryStyle>
  );
};

export const TypeTableCategory = ({ type, children }: TypeCategoryProps) => {
  const { projectDataValues: types } = useProjectTypes();
  const currentType = types[type];
  return <TypeTableCategoryStyle type={currentType ? currentType.color || currentType.dbSymbol : 'normal'}>{children}</TypeTableCategoryStyle>;
};
