import React, { useMemo } from 'react';
import { DataBlockWithTitleNoActive } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioZone } from '@modelEntities/zone';
import { ZonePokemonList } from './ZonePokemonList';
import styled from 'styled-components';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { TableEmpty } from './table/ZoneTableStyle';

const PokemonZoneListGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 17px;
  row-gap: 16px;

  & > * {
    flex-basis: calc(25% - 17px);
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

type ZonePokemonProps = {
  zone: StudioZone;
  groups: ProjectData['groups'];
};

const groupPokemon = (allPokemonInZone: StudioGroupEncounter[]): Map<string, StudioGroupEncounter[]> => {
  return allPokemonInZone.reduce((groupedPokemon, encounter) => {
    const key = `${encounter.specie}-${encounter.form}-${encounter.shinySetup.kind}-${encounter.shinySetup.rate}`;
    const group = groupedPokemon.get(key) || [];
    group.push(encounter);
    groupedPokemon.set(key, group);
    return groupedPokemon;
  }, new Map<string, StudioGroupEncounter[]>());
};

export const ZonePokemon = ({ zone, groups }: ZonePokemonProps) => {
  const { t } = useTranslation('database_zones');

  const allPokemonInZone: StudioGroupEncounter[] = useMemo(() => {
    return zone.wildGroups.flatMap((wildGroup) => groups[wildGroup]?.encounters || []);
  }, [zone.wildGroups, groups]);

  const groupedPokemon = useMemo(() => {
    return groupPokemon(allPokemonInZone);
  }, [allPokemonInZone]);

  if (groupedPokemon.size === 0) {
    return (
      <DataBlockWithTitleNoActive size="full" title={t('zone_pokemon')}>
        <TableEmpty>{t('no_pokemon')}</TableEmpty>
      </DataBlockWithTitleNoActive>
    );
  }

  const pokemonList = Array.from(groupedPokemon.entries()).map(([key, group]) => <ZonePokemonList key={`pokemon-zone-${key}`} pokemon={group[0]} />);

  return (
    <DataBlockWithTitleNoActive size="full" title={t('zone_pokemon')}>
      <PokemonZoneListGrid>{pokemonList}</PokemonZoneListGrid>
    </DataBlockWithTitleNoActive>
  );
};
