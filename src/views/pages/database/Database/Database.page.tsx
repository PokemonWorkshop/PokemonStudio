import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NavigationDatabase } from '../../../components/database/navigation/NavigationDatabase';
import { PokemonPage } from '../Pokemon.page';
import { MovePage } from '../Move.page';
import { ItemPage } from '../Item.page';
import { TypePage } from '../Type.page';
import { TypeMovesPage } from '../Type.Moves.page';
import { TypePokemonPage } from '../Type.Pokemon.page';
import { TypeTablePage } from '../Type.Table.page';
import { MovePokemonPage } from '../Move.Pokemon.page';
import { PokemonMovepoolPage } from '../Pokemon.Movepool.page';
import { AbilityPage } from '../Ability.page';
import { AbilityPokemonPage } from '../Ability.Pokemon.page';
import { QuestPage } from '../Quest.page';
import { TrainerPage } from '../Trainer.page';
import { GroupPage } from '../Group.page';
import { ZonePage } from '../Zone.page';
import { DexPage } from '../Dex/Dex.page';
import { PokemonResourcesPage } from '../Pokemon.Resources.page';
import { TrainerResourcesPage } from '../Trainer.Resources.page';
import { NaturePage } from '../Nature.page';

const DatabasePageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatabasePageComponent = () => {
  return (
    <DatabasePageStyle>
      <NavigationDatabase />
      <Routes>
        <Route path="moves/pokemon" element={<MovePokemonPage />} />
        <Route path="moves" element={<MovePage />} />
        <Route path="pokemon/movepool" element={<PokemonMovepoolPage />} />
        <Route path="pokemon/resources" element={<PokemonResourcesPage />} />
        <Route path="pokemon" element={<PokemonPage />} />
        <Route path="items" element={<ItemPage />} />
        <Route path="abilities/pokemon" element={<AbilityPokemonPage />} />
        <Route path="abilities" element={<AbilityPage />} />
        <Route path="types/table" element={<TypeTablePage />} />
        <Route path="types/:typeDbSymbol/moves" element={<TypeMovesPage />} />
        <Route path="types/:typeDbSymbol/pokemon" element={<TypePokemonPage />} />
        <Route path="types/:typeDbSymbol?" element={<TypePage />} />
        <Route path="quests" element={<QuestPage />} />
        <Route path="trainers" element={<TrainerPage />} />
        <Route path="trainers/resources" element={<TrainerResourcesPage />} />
        <Route path="groups" element={<GroupPage />} />
        <Route path="zones" element={<ZonePage />} />
        <Route path="dex" element={<DexPage />} />
        <Route path="natures" element={<NaturePage />} />
        <Route path="/" element={<Navigate to={sessionStorage.getItem('lastDatabasePage') || 'pokemon'} />} />
      </Routes>
    </DatabasePageStyle>
  );
};

export default DatabasePageComponent;
