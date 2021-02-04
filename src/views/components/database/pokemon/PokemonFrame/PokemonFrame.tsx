import React, { FunctionComponent } from 'react';
import { useGlobalState } from '../../../../../GlobalStateProvider';
import { PokemonDataProps } from '../PokemonDataPropsInterface';
import { PokemonFrameStyle } from './PokemonFrameStyle';

export const PokemonFrame: FunctionComponent<PokemonDataProps> = (
  props: PokemonDataProps
) => {
  const [state, setState] = useGlobalState();
  const { pokemon } = props;

  const pokemonData = state.projectData.pokemon[pokemon];

  return (
    <PokemonFrameStyle>
      <div className="pokemon-side-container">
        <img
          alt="pokemon sprite"
          src="https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png"
        />
      </div>
      <div id="pokemon-info">
        <div id="info-head">
          <div id="info-title">
            <h1 id="name">{pokemonData?.dbSymbol}</h1>
            <span id="id">#{pokemonData?.id}</span>
          </div>
          <div id="info-types">
            <span>{pokemonData.forms[0].type1} - </span>
            <span>{pokemonData.forms[0].type2}</span>
          </div>
        </div>
        <p id="info-description">
          Quand il est jeune, il absorbe les nutriments conservés dans son dos
          pour grandir et se développer.
        </p>
      </div>
      <div className="pokemon-side-container" />
    </PokemonFrameStyle>
  );
};
