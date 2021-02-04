import React, { useState } from 'react';
import { DeleteFrame } from '../../../components/database/pokemon/DeleteFrame';
import { MovePoolFrame } from '../../../components/database/pokemon/MovePoolFrame';
import { PokemonControlBar } from '../../../components/database/pokemon/PokemonControlBar';
import { EvolutionDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/EvolutionDataBlock';
import { ExperienceDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/ExperienceDataBlock';
import { PokedexDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/PokedexDataBlock';
import { ReproductionDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/ReproductionDataBlock';
import { StatisticsDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/StatisticsDataBlock';
import { TalentsDataBlock } from '../../../components/database/pokemon/pokemonDataBlock/TalentsDataBlock';
import { PokemonFrame } from '../../../components/database/pokemon/PokemonFrame';
import { SelectOption } from '../../../components/SelectCustom/SelectCustomPropsInterface';
import { PageContainerStyle } from '../PageContainerStyle';
import { PokemonPageStyle } from './Pokemon.style';

export default function PokemonPage() {
  const [currentPokemon, setCurrentPokemon] = useState('bulbasaur');
  const onPokemonChange = (selected: SelectOption) => {
    setCurrentPokemon(selected.value);
  };

  return !currentPokemon ? (
    <PokemonPageStyle>
      <PokemonControlBar onPokemonChange={onPokemonChange} />
    </PokemonPageStyle>
  ) : (
    <PokemonPageStyle>
      <PokemonControlBar onPokemonChange={onPokemonChange} />
      <PageContainerStyle>
        <div id="main-content">
          <PokemonFrame pokemon={currentPokemon} />
          <div id="datablock-container">
            <PokedexDataBlock />
            <EvolutionDataBlock />
            <TalentsDataBlock />
            <ExperienceDataBlock />
            <ReproductionDataBlock />
            <StatisticsDataBlock />
          </div>
        </div>
        <MovePoolFrame />
        <DeleteFrame />
      </PageContainerStyle>
    </PokemonPageStyle>
  );
}
