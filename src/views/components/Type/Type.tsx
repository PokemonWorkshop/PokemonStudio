import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeProps } from './TypePropsInterface';
import { TypeStyle } from './TypeStyle';

/**
 * Component rendering our type
 * @param type The type of the Pokémon, move or item
 */
export const Type: FunctionComponent<TypeProps> = (props: TypeProps) => {
  const { type } = props;
  const { t } = useTranslation(['database_types']);
  const defaultTypes = [
    'normal',
    'fire',
    'grass',
    'water',
    'electric',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dark',
    'dragon',
    'steel',
    'fairy',
    'physical',
    'special',
    'status',
    'ball',
    'heal',
    'repel',
    'fleeing',
    'event',
    'stone',
    'tech',
  ];

  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getTypeColor() {
    if (defaultTypes.includes(type) === undefined) return 'type-normal';
    return `type-${type}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getText(): any {
    if (defaultTypes.includes(type) === undefined)
      return capitalizeFirstLetter(type);
    return `database_types:${type}`;
  }

  return (
    <TypeStyle>
      <div id={getTypeColor()}>
        <span id="type">{t(getText())}</span>
      </div>
    </TypeStyle>
  );
};
