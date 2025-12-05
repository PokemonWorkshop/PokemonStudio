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
  '@enemy_collapse_se' in object &&
  typeof object['@title_bgm'] === 'object' &&
  typeof object['@battle_bgm'] === 'object' &&
  typeof object['@battle_end_me'] === 'object' &&
  typeof object['@gameover_me'] === 'object' &&
  typeof object['@cursor_se'] === 'object' &&
  typeof object['@decision_se'] === 'object' &&
  typeof object['@cancel_se'] === 'object' &&
  typeof object['@buzzer_se'] === 'object' &&
  typeof object['@equip_se'] === 'object' &&
  typeof object['@shop_se'] === 'object' &&
  typeof object['@save_se'] === 'object' &&
  typeof object['@load_se'] === 'object' &&
  typeof object['@battle_start_se'] === 'object' &&
  typeof object['@escape_se'] === 'object' &&
  typeof object['@actor_collapse_se'] === 'object' &&
  typeof object['@enemy_collapse_se'] === 'object';

const buildAudio = (systemKey: keyof SystemData, systemData: SystemData, projectPath: string): RMXPAudio => {
  const audioData = systemData[systemKey];
  const name = audioData['@name'];
  const type = systemKey.split('_').pop() as RMXPAudioType;
  const nameWithExt = addAudioExtensionFile(projectPath, name, type);
  return {
    name: !name ? '' : `audio/${type}/${nameWithExt}`,
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
    title: buildAudio('@title_bgm', marshalData, projectPath),
    battle: buildAudio('@battle_bgm', marshalData, projectPath),
    battleEnd: buildAudio('@battle_end_me', marshalData, projectPath),
    gameover: buildAudio('@gameover_me', marshalData, projectPath),
    cursor: buildAudio('@cursor_se', marshalData, projectPath),
    decision: buildAudio('@decision_se', marshalData, projectPath),
    cancel: buildAudio('@cancel_se', marshalData, projectPath),
    buzzer: buildAudio('@buzzer_se', marshalData, projectPath),
    equip: buildAudio('@equip_se', marshalData, projectPath),
    shop: buildAudio('@shop_se', marshalData, projectPath),
    save: buildAudio('@save_se', marshalData, projectPath),
    load: buildAudio('@load_se', marshalData, projectPath),
    battleStart: buildAudio('@battle_start_se', marshalData, projectPath),
    escape: buildAudio('@escape_se', marshalData, projectPath),
    actorCollapse: buildAudio('@actor_collapse_se', marshalData, projectPath),
    enemyCollapse: buildAudio('@enemy_collapse_se', marshalData, projectPath),
  };
};
