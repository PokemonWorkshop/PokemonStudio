import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { assertUnreachable } from './assertUnreachable';
import { StudioTrainer } from '@modelEntities/trainer';

export const join = (...strs: string[]): string => {
  return strs.reduce((previousValue, str, index) => {
    const newStr = str
      .replaceAll('\\', '/')
      .split('/')
      .filter((s) => s !== '')
      .join('/');
    if (index === 0 && !strs[0].startsWith('/')) return newStr;
    return [previousValue, newStr].join('/');
  }, '');
};

export const basename = (str: string | undefined, stripExtension?: string): string => {
  if (!str) {
    return '';
  }

  let finalStr: string | undefined = str;

  if (stripExtension) {
    // result example: /\.png$/i
    const regex = new RegExp(`\\${stripExtension}$`, 'i');
    finalStr = str.replace(regex, '');
  }

  finalStr = finalStr.replaceAll('\\', '/').split('/').pop();

  if (finalStr) {
    return finalStr;
  }

  return str;
};

export const stripExtension = (str: string | undefined): string => {
  if (!str) {
    return '';
  }

  return str.substring(0, str.lastIndexOf('.'));
};

export const dirname = (str: string | undefined): string => {
  if (!str) return '';

  const strSplited = str.replaceAll('\\', '/').split('/');
  strSplited.pop();
  return strSplited.join('/');
};

export type CreatureFormResourcesFemalePath =
  | 'iconF'
  | 'iconShinyF'
  | 'frontF'
  | 'frontShinyF'
  | 'backF'
  | 'backShinyF'
  | 'characterF'
  | 'characterShinyF';

export type CreatureFormResourcesPath =
  | 'icon'
  | 'iconShiny'
  | 'front'
  | 'frontShiny'
  | 'back'
  | 'backShiny'
  | 'footprint'
  | 'character'
  | 'characterShiny'
  | 'cry'
  | 'egg'
  | 'iconEgg'
  | CreatureFormResourcesFemalePath;

export const formResourcesPath = (form: StudioCreatureForm, resource: CreatureFormResourcesPath) => {
  if (!form.resources) {
    window.api.log.error('Resources object missing on', form);
    return '';
  }

  const resources = form.resources;

  switch (resource) {
    case 'icon':
    case 'iconF':
    case 'iconShiny':
    case 'iconShinyF':
    case 'iconEgg':
      return `graphics/pokedex/pokeicon/${resources[resource] ?? ''}`;
    case 'front':
    case 'frontF':
    case 'egg':
      return `graphics/pokedex/pokefront/${resources[resource] ?? ''}`;
    case 'frontShiny':
    case 'frontShinyF':
      return `graphics/pokedex/pokefrontshiny/${resources[resource] ?? ''}`;
    case 'back':
    case 'backF':
      return `graphics/pokedex/pokeback/${resources[resource] ?? ''}`;
    case 'backShiny':
    case 'backShinyF':
      return `graphics/pokedex/pokebackshiny/${resources[resource] ?? ''}`;
    case 'footprint':
      return `graphics/pokedex/footprints/${resources.footprint}`;
    case 'character':
    case 'characterF':
    case 'characterShiny':
    case 'characterShinyF':
      return `graphics/characters/${resources[resource] ?? ''}`;
    case 'cry':
      return `audio/se/cries/${form.resources.cry}`;
    default:
      assertUnreachable(resource);
  }
  return '';
};

export const pokemonSpritePath = (form: StudioCreatureForm) => {
  if (form.femaleRate === 100 || form.resources.front === '') return formResourcesPath(form, 'frontF');
  return formResourcesPath(form, 'front');
};

export const pokemonIconPath = (specie: StudioCreature, formId?: number, icon?: 'icon' | 'iconF' | 'iconShiny' | 'iconShinyF') => {
  const form = specie.forms.find((f) => f.form === formId) ?? specie.forms[0];
  const resource = form.femaleRate === 100 ? 'iconF' : 'icon';
  if (!form?.resources[icon ?? resource]) return formResourcesPath(form, resource);
  return formResourcesPath(form, icon ?? resource);
};

export const itemIconPath = (icon: string) => {
  return join('graphics/icons/', `${icon}.png`);
};

export type TrainerResourcesPath = 'sprite' | 'artworkFull' | 'artworkSmall' | 'character' | 'bgm' | 'victory' | 'defeat' | 'encounter';
export type TrainerMusicsPath = Exclude<TrainerResourcesPath, 'sprite' | 'artworkFull' | 'artworkSmall' | 'character'>;

export const trainerResourcePath = (trainer: StudioTrainer, resource: TrainerResourcesPath) => {
  const resources = trainer.resources;
  const musics = trainer.resources.musics;

  switch (resource) {
    case 'artworkFull':
    case 'artworkSmall':
    case 'sprite':
      return `graphics/battlers/${resources[resource]}`;
    case 'character':
      return `graphics/characters/${resources.character}`;
    case 'bgm':
    case 'victory':
    case 'defeat':
    case 'encounter':
      return `audio/bgm/${musics[resource]}`;
    default:
      assertUnreachable(resource);
  }

  return '';
};

export const getMapOverviewPath = (tiledFilename: string) => `Data/Tiled/Overviews/${tiledFilename}.png`;
