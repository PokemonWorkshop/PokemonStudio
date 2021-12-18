import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseGroup } from '../NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '../NavigationDatabaseItem';
import { NavigationDatabaseStyle } from './NavigationDatabaseStyle';

export const NavigationDatabase = () => {
  const { t } = useTranslation(['submenu_database']);
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('submenu_database:data')}>
        <NavigationDatabaseItem path="/database/pokemon" label={t('submenu_database:pokemon')} />
        <NavigationDatabaseItem path="/database/moves" label={t('submenu_database:moves')} />
        <NavigationDatabaseItem path="/database/abilities" label={t('submenu_database:abilities')} />
        <NavigationDatabaseItem path="/database/types" label={t('submenu_database:types')} />
        <NavigationDatabaseItem path="/database/items" label={t('submenu_database:items')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('submenu_database:level_design')}>
        <NavigationDatabaseItem path="/database/zones" label={t('submenu_database:zones')} />
        <NavigationDatabaseItem path="/database/groups" label={t('submenu_database:groups')} />
        <NavigationDatabaseItem path="/database/trainers" label={t('submenu_database:trainers')} />
        <NavigationDatabaseItem path="/database/quests" label={t('submenu_database:quests')} />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
