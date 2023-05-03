import { IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { StudioTextInfo, TEXT_INFO_DESCRIPTION_TEXT_ID, TEXT_INFO_NAME_TEXT_ID } from '@modelEntities/textInfo';
import { stringify } from 'csv-stringify/sync';
import { findFirstAvailableTextId } from '@utils/ModelUtils';
import { getTextFileList, loadCSV } from '@utils/textManagement';

type KeyDefaultTextInfo =
  | 9001
  | 100000
  | 100001
  | 100002
  | 100003
  | 100004
  | 100005
  | 100006
  | 100007
  | 100008
  | 100010
  | 100012
  | 100013
  | 100015
  | 100029
  | 100045
  | 100046
  | 100047
  | 100048
  | 100061
  | 100062
  | 100063
  | 100064;

type DefaultTextInfo = {
  names: string[];
  descriptions: string[];
};

type StudioTextInfoWithText = {
  textInfo: StudioTextInfo;
} & DefaultTextInfo;

const DEFAULT_TEXT_INFOS: Record<KeyDefaultTextInfo, DefaultTextInfo> = {
  9001: {
    names: ['Items plural names', 'Noms pluriels des objets'],
    descriptions: ['', ''],
  },
  100000: {
    names: ['Pokémon names', 'Noms des Pokémon'],
    descriptions: ['', ''],
  },
  100001: {
    names: ['Pokémon species', 'Espèces des Pokémon'],
    descriptions: ['', ''],
  },
  100002: {
    names: ['Pokémon descriptions', 'Descriptions des Pokémon'],
    descriptions: ['', ''],
  },
  100003: {
    names: ['Types names', 'Noms des types'],
    descriptions: ['', ''],
  },
  100004: {
    names: ['Abilities names', 'Noms des talents'],
    descriptions: ['', ''],
  },
  100005: {
    names: ['Abilities descriptions', 'Descriptions des talents'],
    descriptions: ['', ''],
  },
  100006: {
    names: ['Moves names', 'Noms des attaques'],
    descriptions: ['', ''],
  },
  100007: {
    names: ['Moves descriptions', 'Descriptions des attaques'],
    descriptions: ['', ''],
  },
  100008: {
    names: ['Natures names', 'Noms des natures'],
    descriptions: ['', ''],
  },
  100010: {
    names: ['Zones names', 'Noms des zones'],
    descriptions: ['', ''],
  },
  100012: {
    names: ['Items names', 'Noms des objets'],
    descriptions: ['', ''],
  },
  100013: {
    names: ['Items descriptions', 'Descriptions des objets'],
    descriptions: ['', ''],
  },
  100015: {
    names: ['Bag pockets names', 'Noms des poches du sac'],
    descriptions: ['', ''],
  },
  100029: {
    names: ['Trainers class names', 'Noms des classes des dresseurs'],
    descriptions: ['', ''],
  },
  100045: {
    names: ['Quests names', 'Noms des quêtes'],
    descriptions: ['', ''],
  },
  100046: {
    names: ['Quests descriptions', 'Descriptions des quêtes'],
    descriptions: ['', ''],
  },
  100047: {
    names: ['Victory sentences', 'Phrases de victoire'],
    descriptions: [
      'This text file contains the texts used in the case of a player losing to a trainer.',
      "Ce fichier de texte contient les textes utilisés dans le cas d'une défaite du joueur contre un dresseur.",
    ],
  },
  100048: {
    names: ['Defeat sentences', 'Phrases de défaite'],
    descriptions: [
      "This text file contains the texts used in the case of a player's victory against a trainer.",
      "Ce fichier de texte contient les textes utilisés dans le cas d'une victoire du joueur contre un dresseur.",
    ],
  },
  100061: {
    names: ['Groups names', 'Noms des groupes'],
    descriptions: ['', ''],
  },
  100062: {
    names: ['Trainers names', 'Noms des dresseurs'],
    descriptions: ['', ''],
  },
  100063: {
    names: ['Pokédex names', 'Noms des Pokédex'],
    descriptions: ['', ''],
  },
  100064: {
    names: ['Zones descriptions', 'Descriptions des zones'],
    descriptions: ['', ''],
  },
};

const GENERIC_TEXT_INFOS = {
  name: ['Texts #', 'Textes #'],
  description: ['Description of the texts #', 'Description du fichier de textes #'],
};

const STUDIO_CSV_PATH = 'Data/Text/Studio';
const TEXT_INFOS_PATH = 'Data/Studio/text_info.json';

const getTextInfosWithText = (fileId: number, keysDefaultTextInfos: string[], textId: number): StudioTextInfoWithText => {
  const isDefaultTextInfos = keysDefaultTextInfos.includes(fileId.toString());
  const names = isDefaultTextInfos
    ? DEFAULT_TEXT_INFOS[fileId as KeyDefaultTextInfo].names
    : GENERIC_TEXT_INFOS.name.map((text) => `${text}${fileId}`);
  const descriptions = isDefaultTextInfos
    ? DEFAULT_TEXT_INFOS[fileId as KeyDefaultTextInfo].descriptions
    : GENERIC_TEXT_INFOS.description.map((text) => `${text}${fileId}`);
  return {
    textInfo: {
      klass: 'TextInfo',
      fileId,
      textId,
    },
    names,
    descriptions,
  };
};

const mustTextInfosBeUpdated = (projectPath: string) => {
  const textFileList = getTextFileList(projectPath);
  const textInfosFile: StudioTextInfo[] = JSON.parse(
    fs.readFileSync(path.join(projectPath, 'Data', 'Studio', 'text_info.json'), { encoding: 'utf-8' })
  );
  if (textFileList.length !== textInfosFile.length) return true;
  textFileList.sort((a, b) => a - b);
  textInfosFile.sort((a, b) => a.fileId - b.fileId);
  return !textFileList.every((fileId, index) => textInfosFile[index].fileId === fileId);
};

const saveCSV = (projectPath: string, fileId: number, texts: string[][], ignoreHeader?: true) => {
  const csvPath = path.join(projectPath, 'Data', 'Text', 'Studio', `${fileId}.csv`);
  if (!ignoreHeader) texts.unshift(['en', 'fr']); // TODO: get the config language
  fs.writeFileSync(csvPath, stringify(texts));
};

export const updateTextInfos = async (event: IpcMainEvent, payload: { projectPath: string; currentLanguage: string }) => {
  console.info('update-text-infos', payload);
  const textInfosFilePath = path.join(payload.projectPath, TEXT_INFOS_PATH);
  const studioTextPath = path.join(payload.projectPath, STUDIO_CSV_PATH);
  const keysDefaultTextInfos = Object.keys(DEFAULT_TEXT_INFOS);
  try {
    // create the folder Data/Text/Studio if doesn't exist
    if (!fs.existsSync(studioTextPath)) {
      fs.mkdirSync(studioTextPath);
    }
    if (fs.existsSync(textInfosFilePath)) {
      // check if text_infos file and csv files should be updated
      if (!mustTextInfosBeUpdated(payload.projectPath)) {
        console.info('update-text-infos/success', 'nothing to update');
        return event.sender.send('update-text-infos/success', {});
      }
      const textFileList = getTextFileList(payload.projectPath);
      // load text infos data and csv data
      const textInfos: StudioTextInfo[] = JSON.parse(fs.readFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), { encoding: 'utf-8' }));
      const names = await loadCSV(path.join(payload.projectPath, STUDIO_CSV_PATH, TEXT_INFO_NAME_TEXT_ID.toString()));
      const descriptions = await loadCSV(path.join(payload.projectPath, STUDIO_CSV_PATH, TEXT_INFO_DESCRIPTION_TEXT_ID.toString()));
      // clean the text infos data to free unused textId
      const textInfosCleared = textInfos.filter((textInfo) => textFileList.includes(textInfo.fileId)).sort((a, b) => a.textId - b.textId);
      const textInfosUpdated = textFileList.map((fileId) => {
        const textInfo = textInfosCleared.find((textInfo) => textInfo.fileId === fileId);
        if (textInfo) return textInfo;

        const newTextInfoWithText = getTextInfosWithText(fileId, keysDefaultTextInfos, findFirstAvailableTextId(textInfosCleared));
        const { names: newNames, descriptions: newDescriptions, ...newTextInfo } = newTextInfoWithText;
        // add the new text info in text infos
        textInfosCleared.push(newTextInfo.textInfo);
        textInfosCleared.sort((a, b) => a.textId - b.textId);
        // update csv data
        const textId = newTextInfo.textInfo.textId + 1;
        textId >= names.length ? names.push(newNames) : (names[textId] = newNames);
        textId >= descriptions.length ? descriptions.push(newDescriptions) : (descriptions[textId] = newDescriptions);
        return newTextInfo.textInfo;
      });
      saveCSV(payload.projectPath, 200000, names, true);
      saveCSV(payload.projectPath, 200001, descriptions, true);
      fs.writeFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), JSON.stringify(textInfosUpdated, null, 2));
      console.info('update-text-infos/success', 'updated file');
      event.sender.send('update-text-infos/success', {});
    } else {
      // text_infos file doesn't exist, so we create and the csv files associated
      const textInfosWithText = getTextFileList(payload.projectPath).map((fileId, index) => {
        return getTextInfosWithText(fileId, keysDefaultTextInfos, index);
      });
      const names = textInfosWithText.map((textInfo) => textInfo.names);
      const descriptions = textInfosWithText.map((textInfo) => textInfo.descriptions);
      const textInfos = textInfosWithText.map((textInfoWithText) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { names: _, descriptions: __, ...textInfo } = textInfoWithText;
        return { fileId: textInfo.textInfo.fileId, textId: textInfo.textInfo.textId, klass: textInfo.textInfo.klass };
      });
      fs.writeFileSync(path.join(payload.projectPath, TEXT_INFOS_PATH), JSON.stringify(textInfos, null, 2));
      saveCSV(payload.projectPath, 200000, names);
      saveCSV(payload.projectPath, 200001, descriptions);
      console.info('update-text-infos/success', 'file created');
      event.sender.send('update-text-infos/success', {});
    }
  } catch (error) {
    console.error('update-text-infos/failure', error);
    event.sender.send('update-text-infos/failure', { errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const registerUpdateTextInfos = (ipcMain: Electron.IpcMain) => {
  ipcMain.on('update-text-infos', updateTextInfos);
};
