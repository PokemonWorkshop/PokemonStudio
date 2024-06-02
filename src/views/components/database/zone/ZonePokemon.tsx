import React from 'react';
import { DataBlockWithTitleNoActive, DataGrid } from '../dataBlocks';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '@src/GlobalStateProvider';
import { StudioZone } from '@modelEntities/zone';
import { ZonePokemonList } from './ZonePokemonList';
import styled from 'styled-components';

export const PokemonZoneListGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

  const pokemonList = zone.wildGroups.map((wildGroup) => {
    if (wildGroup.length === 0 || groups[wildGroup] === undefined) {
      return (
        <span key={wildGroup} className="no-data">
          {t('no_pokemon')}
        </span>
      );
    }
    const groupEncounters = groups[wildGroup].encounters;
    return (
      <PokemonZoneListGrid key={wildGroup}>
        {groupEncounters.map((encounter, index) => (
          <ZonePokemonList key={`pokemon-zone-${index}`} pokemon={encounter} />
        ))}
      </PokemonZoneListGrid>
    );
  });

  return (
    <DataBlockWithTitleNoActive size="full" title={t('zone_pokemon')}>
      <DataGrid flow="row">{pokemonList}</DataGrid>
    </DataBlockWithTitleNoActive>
  );
};
