import React, { FunctionComponent } from 'react';
import { NavigationDatabaseGroupSeparator } from '../NavigationDatabaseGroupSeparator/NavigationDatabaseGroupSeparator';
import { NavigationDatabaseItem } from '../NavigationDatabaseItem';
import { NavigationDatabaseContainer } from './NavigationDatabaseContainer';

export const NavigationDatabaseComponent: FunctionComponent = () => {
  return (
    <NavigationDatabaseContainer>
      <NavigationDatabaseGroupSeparator text="data" />

      <NavigationDatabaseItem path="/database/moves" text="moves" />
      <NavigationDatabaseItem path="/database/pokemon" text="pokemon" />
      <NavigationDatabaseItem path="/database/items" text="items" />
      <NavigationDatabaseItem path="/database/abilities" text="abilities" />
      <NavigationDatabaseItem path="/database/types" text="types" />

      <NavigationDatabaseGroupSeparator text="level_design" />

      <NavigationDatabaseItem path="/database/trainers" text="trainers" />
      <NavigationDatabaseItem path="/database/groups" text="groups" />
      <NavigationDatabaseItem path="/database/quests" text="quests" />
      <NavigationDatabaseItem path="/database/zones" text="zones" />
    </NavigationDatabaseContainer>
  );
};
