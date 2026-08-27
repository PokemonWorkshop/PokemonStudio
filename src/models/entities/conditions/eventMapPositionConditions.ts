import { DbSymbol } from '@modelEntities/dbSymbol';
import { StudioCondition } from './condition';
import { CONDITION_OPERATOR_GROUPS } from './operators';

export const playerDirection: StudioCondition = {
  dbSymbol: 'player_direction' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['up', 'down', 'left', 'right'],
    },
  ],
};

export const eventDirection: StudioCondition = {
  dbSymbol: 'event_direction' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'event',
    },
  ],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['up', 'down', 'left', 'right'],
    },
  ],
};

export const playerPosition: StudioCondition = {
  dbSymbol: 'player_position' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'position',
    },
  ],
};

export const eventPosition: StudioCondition = {
  dbSymbol: 'event_position' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  subjectTypes: [
    {
      type: 'database_reference',
      referenceType: 'event',
    },
  ],
  valueTypes: [
    {
      type: 'position',
    },
  ],
};

export const currentMap: StudioCondition = {
  dbSymbol: 'current_map' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'database_reference',
      referenceType: 'map',
    },
  ],
};

export const playerTerrainTag: StudioCondition = {
  dbSymbol: 'player_terrain_tag' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['none', '0', '1', '2', '3'],
    },
  ],
};

export const playerSystemTag: StudioCondition = {
  dbSymbol: 'player_system_tag' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['RegularGround', 'Grass', 'TallGrass', 'Cave', 'Mountain', 'Sand', 'Pond', 'Ocean', 'UnderWater', 'Snow', 'Ice', 'HeadButt'],
    },
  ],
};

export const zoneType: StudioCondition = {
  dbSymbol: 'zone_type' as DbSymbol,
  operators: CONDITION_OPERATOR_GROUPS['Enumerator'],
  valueTypes: [
    {
      type: 'enum',
      enumValues: ['indoor', 'outdoor'],
    },
  ],
};
