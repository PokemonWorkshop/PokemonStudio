import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationDatabaseGroup } from '../NavigationDatabaseGroup';
import { NavigationDatabaseItem } from '../NavigationDatabaseItem';
import { NavigationDatabaseStyle } from './NavigationDatabaseStyle';

export const NavigationDatabase = () => {
  const { t } = useTranslation('submenu_database');
  return (
    <NavigationDatabaseStyle>
      <NavigationDatabaseGroup title={t('data')}>
        <NavigationDatabaseItem path="/database/dex" label={t('dex')} />
        <NavigationDatabaseItem path="/database/pokemon" label={t('pokemon')} />
        <NavigationDatabaseItem path="/database/moves" label={t('moves')} />
        <NavigationDatabaseItem path="/database/abilities" label={t('abilities')} />
        <NavigationDatabaseItem path="/database/types" label={t('types')} />
        <NavigationDatabaseItem path="/database/items" label={t('items')} />
        <NavigationDatabaseItem path="/database/natures" label={t('natures')} />
      </NavigationDatabaseGroup>
      <NavigationDatabaseGroup title={t('level_design')}>
        <NavigationDatabaseItem path="/database/zones" label={t('zones')} />
        <NavigationDatabaseItem path="/database/groups" label={t('groups')} />
        <NavigationDatabaseItem path="/database/trainers" label={t('trainers')} />
        <NavigationDatabaseItem path="/database/quests" label={t('quests')} />
      </NavigationDatabaseGroup>
    </NavigationDatabaseStyle>
  );
};
