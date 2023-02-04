import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { StudioTrainer } from '@modelEntities/trainer';
import { assertUnreachable } from './assertUnreachable';

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
    finalStr = finalStr.replaceAll(stripExtension, '');
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
  | CreatureFormResourcesFemalePath;

export const formResourcesPath = (form: StudioCreatureForm, resource: CreatureFormResourcesPath) => {
  if (!form.resources) {
    console.error('Resources object missing on', form);
    return '';
  }

  const resources = form.resources;

  switch (resource) {
    case 'icon':
    case 'iconF':
      return `graphics/pokedex/pokeicon/${(resources.hasFemale && resources[resource]) || resources.icon}.png`;
    case 'iconShiny':
    case 'iconShinyF':
      return `graphics/pokedex/pokeicon/${(resources.hasFemale && resources[resource]) || resources.iconShiny}.png`;
    case 'front':
    case 'frontF':
      return `graphics/pokedex/pokefront/${(resources.hasFemale && resources[resource]) || resources.front}.png`;
    case 'frontShiny':
    case 'frontShinyF':
      return `graphics/pokedex/pokefrontshiny/${(resources.hasFemale && resources[resource]) || resources.frontShiny}.png`;
    case 'back':
    case 'backF':
      return `graphics/pokedex/pokeback/${(resources.hasFemale && resources[resource]) || resources.back}.png`;
    case 'backShiny':
    case 'backShinyF':
      return `graphics/pokedex/pokebackshiny/${(resources.hasFemale && resources[resource]) || resources.backShiny}.png`;
    case 'footprint':
      return `graphics/pokedex/footprints/${resources.footprint}.png`;
    case 'character':
    case 'characterF':
      return `graphics/characters/${(resources.hasFemale && resources[resource]) || resources.character}.png`;
    case 'characterShiny':
    case 'characterShinyF':
      return `graphics/characters/${(resources.hasFemale && resources[resource]) || resources.characterShiny}.png`;
    case 'cry':
      return `audio/se/cries/${form.resources.cry}`;
    default:
      assertUnreachable(resource);
  }
  return '';
};

export const pokemonSpritePath = (form: StudioCreatureForm) => {
  return formResourcesPath(form, 'front');
};

export const pokemonIconPath = (specie: StudioCreature, formId?: number) => {
  if (formId) {
    const form = specie.forms.find((f) => f.form === formId);
    if (form) return formResourcesPath(form, 'icon');
  }
  return formResourcesPath(specie.forms[0], 'icon');
};

export const itemIconPath = (icon: string, projectPath: string | null) => {
  if (!projectPath) return 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png';
  return join(projectPath, 'graphics/icons/', `${icon}.png`);
};

export const trainerSpritePath = (trainer: StudioTrainer, projectPath: string) => `${projectPath}/graphics/battlers/${trainer.battlers[0]}.png`;
export const trainerSpriteBigPath = (trainer: StudioTrainer, projectPath: string) =>
  `${projectPath}/graphics/battlers/${trainer.battlers[0]}_big.png`;
