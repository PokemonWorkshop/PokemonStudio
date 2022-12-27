import React from 'react';
import styled from 'styled-components';
import { Switch, Route, useRouteMatch } from 'react-router';
import { Redirect } from 'react-router-dom';
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
import { DexPage } from '../Dex.page';
import { PokemonResourcesPage } from '../Pokemon.Resources.page';

const DatabasePageStyle = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatabasePageComponent = () => {
  const { path } = useRouteMatch();
  return (
    <DatabasePageStyle>
      <NavigationDatabase />
      <Switch>
        <Route path={`${path}/moves/pokemon`}>
          <MovePokemonPage />
        </Route>
        <Route path={`${path}/moves`}>
          <MovePage />
        </Route>
        <Route path={`${path}/pokemon/movepool`}>
          <PokemonMovepoolPage />
        </Route>
        <Route path={`${path}/pokemon/resources`}>
          <PokemonResourcesPage />
        </Route>
        <Route path={`${path}/pokemon`}>
          <PokemonPage />
        </Route>
        <Route path={`${path}/items`}>
          <ItemPage />
        </Route>
        <Route path={`${path}/abilities/pokemon`}>
          <AbilityPokemonPage />
        </Route>
        <Route path={`${path}/abilities`}>
          <AbilityPage />
        </Route>
        <Route path={`${path}/types/table`}>
          <TypeTablePage />
        </Route>
        <Route path={`${path}/types/:typeDbSymbol/moves`}>
          <TypeMovesPage />
        </Route>
        <Route path={`${path}/types/:typeDbSymbol/pokemon`}>
          <TypePokemonPage />
        </Route>
        <Route path={`${path}/types/:typeDbSymbol?`}>
          <TypePage />
        </Route>
        <Route path={`${path}/quests`}>
          <QuestPage />
        </Route>
        <Route path={`${path}/trainers`}>
          <TrainerPage />
        </Route>
        <Route path={`${path}/groups`}>
          <GroupPage />
        </Route>
        <Route path={`${path}/zones`}>
          <ZonePage />
        </Route>
        <Route path={`${path}/dex`}>
          <DexPage />
        </Route>
        <Route path={`${path}`}>
          <Redirect to={`${path}/pokemon`} />
        </Route>
      </Switch>
    </DatabasePageStyle>
  );
};

export default DatabasePageComponent;
