import { DbSymbol } from '@modelEntities/dbSymbol';
import { SelectedDataIdentifier } from '@src/GlobalStateProvider';
import log from 'electron-log';
import { getEntityNameTextUsingTextId } from './ReadingProjectText';
import type { PreGlobalState } from '../hooks/useProjectLoad/types';
import { parseJSON } from './json/parse';

const firstByNameUsingTextId = (
  data: Record<string, Parameters<typeof getEntityNameTextUsingTextId>[0] & { dbSymbol: DbSymbol }>,
  state: PreGlobalState
): string => {
  return Object.values(data).sort((a, b) => getEntityNameTextUsingTextId(a, state).localeCompare(getEntityNameTextUsingTextId(b, state)))[0].dbSymbol;
};

const firstById = <T extends { id: number; dbSymbol: string }>(data: Record<string, T>): string => {
  return Object.values(data).sort((a, b) => a.id - b.id)[0]?.dbSymbol || '__undef__';
};

const getSelectedIdentifierFromStorage = (preState: PreGlobalState) => {
  try {
    const identifiers = localStorage.getItem(`selectedDataIdentifier:${window.api.md5(preState.projectStudio.title)}`);
    if (identifiers) return parseJSON<SelectedDataIdentifier>(identifiers, 'identifier from local storage');
  } catch (error) {
    log.error('Failed to get data identifier from local storage');
  }
  return {} as unknown as SelectedDataIdentifier;
};

const getSelectedIdentifier = <T extends keyof SelectedDataIdentifier>(
  preState: PreGlobalState,
  selectedFromStorage: SelectedDataIdentifier,
  key: T,
  dataKey: keyof PreGlobalState['projectData']
): SelectedDataIdentifier[T] | undefined => {
  if (key === 'pokemon') {
    const identifier = selectedFromStorage.pokemon;
    if (!identifier) return undefined;

    const creature = preState.projectData.pokemon[identifier.specie];
    if (!creature) return undefined;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {
      specie: identifier.specie,
      form: creature.forms[identifier.form] ? identifier.form : 0, // For some reason it's not actually storing the form (wtf)
    }; // Note: typescript is lost for whatever reeason, let's see on updates of typescript if it's no longer lost before rewriting this perfectly valid code
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const identifier = selectedFromStorage[key];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (preState.projectData[dataKey][identifier]) return identifier;

  return undefined;
};

const getMapLinkIdentifier = (selectedFromStorage: SelectedDataIdentifier, preState: PreGlobalState, validMaps: number[]) => {
  const expectedMapId = Number(selectedFromStorage.mapLink);
  const maps = Object.values(preState.projectData.maps);

  if (maps.find(({ id }) => id === expectedMapId)) return expectedMapId.toString();

  return (
    maps
      .filter(({ id }) => validMaps.includes(id))
      .sort((a, b) => a.id - b.id)[0]
      ?.id.toString() || '__undef__'
  );
};

const getTextInfoIdentifier = (selectedFromStorage: SelectedDataIdentifier, textInfos: PreGlobalState['textInfos']) => {
  const expectedTextInfosFileId = Number(selectedFromStorage.textInfo);

  if (textInfos.find(({ fileId }) => fileId === expectedTextInfosFileId)) return expectedTextInfosFileId;

  return textInfos.sort(({ fileId: a, fileId: b }) => a - b)[0]?.fileId || 0;
};

export const generateSelectedIdentifier = (preState: PreGlobalState): SelectedDataIdentifier => {
  const projectData = preState.projectData;
  const selectedFromStorage = getSelectedIdentifierFromStorage(preState);
  const validMaps = Object.values(projectData.zones)
    .filter((zone) => zone.isFlyAllowed && !zone.isWarpDisallowed)
    .flatMap((zone) => zone.maps);
  return {
    pokemon: getSelectedIdentifier(preState, selectedFromStorage, 'pokemon', 'pokemon') || {
      specie: firstById(projectData.pokemon),
      form: 0,
    },
    move: getSelectedIdentifier(preState, selectedFromStorage, 'move', 'moves') || firstById(projectData.moves),
    item: getSelectedIdentifier(preState, selectedFromStorage, 'item', 'items') || firstById(projectData.items),
    quest: getSelectedIdentifier(preState, selectedFromStorage, 'quest', 'quests') || firstById(projectData.quests),
    trainer: getSelectedIdentifier(preState, selectedFromStorage, 'trainer', 'trainers') || firstById(projectData.trainers),
    type: getSelectedIdentifier(preState, selectedFromStorage, 'type', 'types') || firstByNameUsingTextId(projectData.types, preState),
    zone: getSelectedIdentifier(preState, selectedFromStorage, 'zone', 'zones') || firstById(projectData.zones),
    ability: getSelectedIdentifier(preState, selectedFromStorage, 'ability', 'abilities') || firstByNameUsingTextId(projectData.abilities, preState),
    group: getSelectedIdentifier(preState, selectedFromStorage, 'group', 'groups') || firstById(projectData.groups),
    dex: getSelectedIdentifier(preState, selectedFromStorage, 'dex', 'dex') || firstById(projectData.dex),
    mapLink: getMapLinkIdentifier(selectedFromStorage, preState, validMaps),
    textInfo: getTextInfoIdentifier(selectedFromStorage, preState.textInfos),
    map: getSelectedIdentifier(preState, selectedFromStorage, 'map', 'maps') || firstById(projectData.maps),
    nature: getSelectedIdentifier(preState, selectedFromStorage, 'nature', 'natures') || firstById(projectData.natures),
  };
};
