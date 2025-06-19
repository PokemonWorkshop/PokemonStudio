import fsPromise from 'fs/promises';
import { isMarshalStandardObject, Marshal } from 'ts-marshal';
import { addAudioExtensionFile, isRecord, type RMXPAudioType, type AudioData, type RMXPAudio } from '@utils/rmxpUtils';
import path from 'path';

// RMXP Documentation: https://www.rpg-maker.fr/dl/monos/aide/xp/index.html?page=source%2Frgss%2Frgss.html

export type RMXPSystem = {
  title: RMXPAudio;
  battle: RMXPAudio;
  battleEnd: RMXPAudio;
  gameover: RMXPAudio;
  cursor: RMXPAudio;
  decision: RMXPAudio;
  cancel: RMXPAudio;
  buzzer: RMXPAudio;
  equip: RMXPAudio;
  shop: RMXPAudio;
  save: RMXPAudio;
  load: RMXPAudio;
  battleStart: RMXPAudio;
  escape: RMXPAudio;
  actorCollapse: RMXPAudio;
  enemyCollapse: RMXPAudio;
};

type SystemData = {
  '@title_bgm': AudioData;
  '@battle_bgm': AudioData;
  '@battle_end_me': AudioData;
  '@gameover_me': AudioData;
  '@cursor_se': AudioData;
  '@decision_se': AudioData;
  '@cancel_se': AudioData;
  '@buzzer_se': AudioData;
  '@equip_se': AudioData;
  '@shop_se': AudioData;
  '@save_se': AudioData;
  '@load_se': AudioData;
  '@battle_start_se': AudioData;
  '@escape_se': AudioData;
  '@actor_collapse_se': AudioData;
  '@enemy_collapse_se': AudioData;
};

export const isSystemObject = (object: unknown): object is SystemData =>
  isMarshalStandardObject(object) &&
  '@title_bgm' in object &&
  '@battle_bgm' in object &&
  '@battle_end_me' in object &&
  '@gameover_me' in object &&
  '@cursor_se' in object &&
  '@decision_se' in object &&
  '@cancel_se' in object &&
  '@buzzer_se' in object &&
  '@equip_se' in object &&
  '@shop_se' in object &&
  '@save_se' in object &&
  '@load_se' in object &&
  '@battle_start_se' in object &&
  '@escape_se' in object &&
  '@actor_collapse_se' in object &&
  '@enemy_collapse_se' in object;

const buildAudio = (audioData: AudioData, projectPath: string): RMXPAudio => {
  const name = audioData['@name'];
  const type = name.split('_').pop() as RMXPAudioType;
  return {
    name: addAudioExtensionFile(projectPath, name, type),
    pitch: audioData['@pitch'],
    volume: audioData['@volume'],
  };
};

export const readRMXPSystem = async (projectPath: string): Promise<RMXPSystem | undefined> => {
  const systemData = await fsPromise.readFile(path.join(projectPath, 'Data/System.rxdata'));
  const marshalData = Marshal.load(systemData);
  if (!isRecord(marshalData)) throw new Error('Loaded object is not a Record');

  if (!isSystemObject(marshalData)) return undefined;

  return {
    title: buildAudio(marshalData['@title_bgm'], projectPath),
    battle: buildAudio(marshalData['@battle_bgm'], projectPath),
    battleEnd: buildAudio(marshalData['@battle_end_me'], projectPath),
    gameover: buildAudio(marshalData['@gameover_me'], projectPath),
    cursor: buildAudio(marshalData['@cursor_se'], projectPath),
    decision: buildAudio(marshalData['@decision_se'], projectPath),
    cancel: buildAudio(marshalData['@cancel_se'], projectPath),
    buzzer: buildAudio(marshalData['@buzzer_se'], projectPath),
    equip: buildAudio(marshalData['@equip_se'], projectPath),
    shop: buildAudio(marshalData['@shop_se'], projectPath),
    save: buildAudio(marshalData['@save_se'], projectPath),
    load: buildAudio(marshalData['@load_se'], projectPath),
    battleStart: buildAudio(marshalData['@battle_start_se'], projectPath),
    escape: buildAudio(marshalData['@escape_se'], projectPath),
    actorCollapse: buildAudio(marshalData['@actor_collapse_se'], projectPath),
    enemyCollapse: buildAudio(marshalData['@enemy_collapse_se'], projectPath),
  };
};
