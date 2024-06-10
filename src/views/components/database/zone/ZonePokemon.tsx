import React from 'react';
import { DataBlockWithTitleNoActive } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioZone } from '@modelEntities/zone';
import { ZonePokemonList } from './ZonePokemonList';
import styled from 'styled-components';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { TableEmpty } from './table/ZoneTableStyle';

export const PokemonZoneListGrid = styled.div`
  display: flex;
  grid-template-columns: 1fr 1fr 1fr;
  flex-wrap: wrap;
  justify-content: space-between;
  column-gap: 17px;
  row-gap: 16px;

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

export const ZonePokemon = ({ zone, groups }: ZonePokemonProps) => {
  const { t } = useTranslation('database_zones');
  const allPokemonInZone: StudioGroupEncounter[] = [];
  zone.wildGroups.forEach((wildGroup) => {
    if (groups[wildGroup]) {
      allPokemonInZone.push(...groups[wildGroup].encounters);
    }
  });

  if (allPokemonInZone.length === 0) {
    return (
      <DataBlockWithTitleNoActive size="full" title={t('zone_pokemon')}>
        <TableEmpty>{t('no_pokemon')}</TableEmpty>
      </DataBlockWithTitleNoActive>
    );
  }

  const pokemonList = allPokemonInZone.map((encounter, index) => <ZonePokemonList key={`pokemon-zone-${index}`} pokemon={encounter} />);

  return (
    <DataBlockWithTitleNoActive size="full" title={t('zone_pokemon')}>
      <PokemonZoneListGrid>{pokemonList}</PokemonZoneListGrid>
    </DataBlockWithTitleNoActive>
  );
};
