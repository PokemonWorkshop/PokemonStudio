import { IpcMainEvent } from 'electron';
import fs from 'fs';
import path from 'path';
import { readProjectFolder } from '@src/backendTasks/readProjectData';
import { TypedJSON } from 'typedjson';
import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import PokemonForm, { CreatureResources } from '@modelEntities/pokemon/PokemonForm';
import { padStr } from '@utils/PadStr';
import fsPromise from 'fs/promises';

const deletePSDKDatFile = (projectPath: string) => {
  const psdkDatFilePath = path.join(projectPath, 'Data', 'Studio', 'psdk.dat');
  if (fs.existsSync(psdkDatFilePath)) fs.unlinkSync(psdkDatFilePath);
};

type DexResource = 'footprints' | 'pokeback' | 'pokebackshiny' | 'pokefront' | 'pokefrontshiny' | 'pokeicon';

const searchDexResource = (id: number, formId: number, dexResource: DexResource, projectPath: string, isFemale: boolean, isShiny?: boolean) => {
  const resourcePath = path.join(projectPath, 'graphics/pokedex', dexResource);

  const resourceName = `${padStr(id, 3)}${isFemale ? 'f' : ''}${isShiny ? 's' : ''}${formId === 0 ? '' : `_${padStr(formId, 2)}`}.png`;
  const result = fs.existsSync(path.join(resourcePath, resourceName));
  if (result) return resourceName.replace('.png', '');

  const resourceNameIgnoreForm = `${padStr(id, 3)}${isFemale ? 'f' : ''}${isShiny ? 's' : ''}.png`;
  if (fs.existsSync(path.join(resourcePath, resourceNameIgnoreForm))) return resourceNameIgnoreForm.replace('.png', '');

  return isFemale ? undefined : '';
};

const searchCharacterResource = (id: number, formId: number, projectPath: string, isFemale: boolean, isShiny: boolean) => {
  const characterPath = path.join(projectPath, 'graphics/characters');

  const characterName = `${padStr(id, 3)}${isFemale ? 'f' : ''}${isShiny ? 's' : ''}_${formId}.png`;
  const result = fs.existsSync(path.join(characterPath, characterName));
  if (result) return characterName.replace('.png', '');

  return isFemale ? undefined : '';
};

const searchCry = (id: number, projectPath: string) => {
  const cryPath = path.join(projectPath, 'audio/se/cries');

  const cryName = `${padStr(id, 3)}cry.ogg`;
  const result = fs.existsSync(path.join(cryPath, cryName));
  return result ? cryName : '';
};

const hasFemale = (resources: Omit<CreatureResources, 'hasFemale'>) => {
  return !!(
    resources.backF ||
    resources.backShinyF ||
    resources.characterF ||
    resources.characterShinyF ||
    resources.frontF ||
    resources.frontShinyF ||
    resources.iconF ||
    resources.iconShinyF
  );
};

const fixResourcesForFemaleOnly = (form: PokemonForm, resources: Omit<CreatureResources, 'hasFemale'>) => {
  if (form.femaleRate !== 100) return resources;

  if (resources.back !== '') resources.backF ??= resources.back;
  if (resources.backShiny !== '') resources.backShinyF ??= resources.backShiny;
  if (resources.character !== '') resources.characterF ??= resources.character;
  if (resources.characterShiny !== '') resources.characterShinyF ??= resources.characterShiny;
  if (resources.front !== '') resources.frontF ??= resources.front;
  if (resources.frontShiny !== '') resources.frontShinyF ??= resources.frontShiny;
  if (resources.icon !== '') resources.iconF ??= resources.icon;
  if (resources.iconShiny !== '') resources.iconShinyF ??= resources.iconShiny;
  return resources;
};

const linkResources = (creature: PokemonModel, projectPath: string) => {
  creature.forms.forEach((form) => {
    if (!form.resources) {
      const resources: Omit<CreatureResources, 'hasFemale'> = {
        icon: searchDexResource(creature.id, form.form, 'pokeicon', projectPath, false, false) as string,
        iconF: searchDexResource(creature.id, form.form, 'pokeicon', projectPath, true, false),
        iconShiny: searchDexResource(creature.id, form.form, 'pokeicon', projectPath, false, true) as string,
        iconShinyF: searchDexResource(creature.id, form.form, 'pokeicon', projectPath, true, true),
        front: searchDexResource(creature.id, form.form, 'pokefront', projectPath, false) as string,
        frontF: searchDexResource(creature.id, form.form, 'pokefront', projectPath, true),
        frontShiny: searchDexResource(creature.id, form.form, 'pokefrontshiny', projectPath, false) as string,
        frontShinyF: searchDexResource(creature.id, form.form, 'pokefrontshiny', projectPath, true),
        back: searchDexResource(creature.id, form.form, 'pokeback', projectPath, false) as string,
        backF: searchDexResource(creature.id, form.form, 'pokeback', projectPath, true),
        backShiny: searchDexResource(creature.id, form.form, 'pokebackshiny', projectPath, false) as string,
        backShinyF: searchDexResource(creature.id, form.form, 'pokebackshiny', projectPath, true),
        footprint: searchDexResource(creature.id, form.form, 'footprints', projectPath, false) as string,
        character: searchCharacterResource(creature.id, form.form, projectPath, false, false) as string,
        characterF: searchCharacterResource(creature.id, form.form, projectPath, true, false),
        characterShiny: searchCharacterResource(creature.id, form.form, projectPath, false, true) as string,
        characterShinyF: searchCharacterResource(creature.id, form.form, projectPath, true, true),
        cry: searchCry(creature.id, projectPath),
      };
      const resourcesFixed = fixResourcesForFemaleOnly(form, resources);
      form.resources = {
        ...resourcesFixed,
        hasFemale: hasFemale(resourcesFixed),
      };
    }
  });
};

export const linkResourcesToCreatures = async (_: IpcMainEvent, projectPath: string) => {
  const serializer = new TypedJSON(PokemonModel);
  serializer.config({ indent: 2 });

  deletePSDKDatFile(projectPath);

  const creatureData = await readProjectFolder(projectPath, 'pokemon');
  await creatureData.reduce(async (lastPromise, creature) => {
    await lastPromise;
    const creatureParsed = serializer.parse(creature);
    if (creatureParsed) {
      linkResources(creatureParsed, projectPath);
      return fsPromise.writeFile(
        path.join(projectPath, 'Data/Studio/pokemon', `${creatureParsed.dbSymbol}.json`),
        serializer.stringify(creatureParsed)
      );
    }
  }, Promise.resolve());
};
