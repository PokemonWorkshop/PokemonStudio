import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router';
import { NavigationDatabaseComponent } from '../../../components/database/navigation/NavigationDatabase';
import { DatabasePageStyle } from './Database.style';
import PokemonPage from '../Pokemon/Pokemon.page';
import MovePage from '../Move/Move.page';

export default function DatabasePage() {
  const { path } = useRouteMatch();
  return (
    <DatabasePageStyle>
      <NavigationDatabaseComponent />
      <Switch>
        <Route path={`${path}/moves`}>
          <MovePage />
        </Route>
        <Route path={`${path}/pokemon`}>
          <PokemonPage />
        </Route>
        <Route path={`${path}/items`}>Items page</Route>
        <Route path={`${path}/abilities`}>Abilities page</Route>
        <Route path={`${path}/types`}>Types page</Route>
      </Switch>
    </DatabasePageStyle>
  );
}
