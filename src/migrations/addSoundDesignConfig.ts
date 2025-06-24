import { deletePSDKDatFile } from './migrateUtils';
import fs from 'fs';
import fsPromise from 'fs/promises';
import { IpcMainEvent } from 'electron';
import path from 'path';
import { readRMXPSystem, type RMXPSystem } from '@src/backendTasks/readRMXPSystem';
import type { SoundDesignConfig } from '@modelEntities/config';
import type { RMXPAudioType } from '@utils/rmxpUtils';

const initAudio = (filename: string, type: RMXPAudioType) => ({
  name: `audio/${type}/${filename}`,
  volume: 100,
  pitch: 100,
});

const initSoundDesignConfig = (rmxpSystem: RMXPSystem): SoundDesignConfig => ({
  klass: 'Configs::Project::SoundDesign',
  soundEffects: {
    decision: rmxpSystem.decision,
    cancel: rmxpSystem.cancel,
    buzzer: rmxpSystem.buzzer,
    save: rmxpSystem.save,
    load: rmxpSystem.load,
    cursor: rmxpSystem.cursor,
    shop: rmxpSystem.shop,
    buy: initAudio('purchase_sound.ogg', 'se'),
    pcStart: initAudio('computer_on.wav', 'se'),
    pcShutdown: initAudio('computer_off.wav', 'se'),
    jump: initAudio('jump.wav', 'se'),
    bump: initAudio('bump.wav', 'se'),
    battleStart: rmxpSystem.battleStart,
    defaultExclamation: initAudio('015-jump01.ogg', 'se'),
    escape: rmxpSystem.escape,
    ability: initAudio('in-battle_ability_activate.ogg', 'se'),
    megaEvolve: initAudio('mega-evolution.ogg', 'se'),
    moveEffective: initAudio('hit.wav', 'se'),
    moveVeryEffective: initAudio('hitplus.wav', 'se'),
    moveNotVeryEffective: initAudio('hitlow.wav', 'se'),
    shiny: initAudio('se_shiny.wav', 'se'),
    statRiseUp: initAudio('moves/stat_rise_up.mp3', 'se'),
    statFallDown: initAudio('moves/stat_fall_down.mp3', 'se'),
    sendingBall: initAudio('fall.wav', 'se'),
    openingBall: initAudio('pokeopen.wav', 'se'),
    backBall: initAudio('pokeopen.wav', 'se'),
    actorCollapse: rmxpSystem.actorCollapse,
    enemyCollapse: rmxpSystem.enemyCollapse,
    eggMove: initAudio('pokemove.wav', 'se'),
    experienceGain: initAudio('exp_sound.wav', 'se'),
  },
  musicEffects: {
    questProgression: initAudio('rosa_keyitemobtained.ogg', 'me'),
    receivedCreature: initAudio('rosa_yourpokemonevolved.ogg', 'me'),
    levelUp: initAudio('rosa_levelup.ogg', 'me'),
    receiveItem: initAudio('rosa_itemobtained.ogg', 'me'),
    receiveKeyItem: initAudio('rosa_keyitemobtained.ogg', 'me'),
    receiveBerry: initAudio('obtained a berry!.ogg', 'me'),
    obtainBadge: initAudio('rosa_badgeobtained.ogg', 'me'),
    gameOver: rmxpSystem.gameover,
    catchCreature: initAudio('caughtjingle.ogg', 'me'),
  },
  backgroundSound: {},
  backgroundMusic: {
    surf: initAudio('pkmrs-surfing.mid', 'bgm'),
    acroBike: initAudio('09 bicycle.ogg', 'bgm'),
    machBike: initAudio('09 bicycle.ogg', 'bgm'),
    baseWildBattle: initAudio('rosa_wild_battle.ogg', 'bgm'),
    baseWildDefeat: initAudio('xy_wild_battle_victory.ogg', 'bgm'),
    defaultEye: initAudio('pkmrs-enc1.mid', 'bgm'),
    baseTrainerBattle: initAudio('xy_trainer_battle.ogg', 'bgm'),
    baseTrainerDefeatBattle: initAudio('xy_trainer_battle_victory.ogg', 'bgm'),
    evolve: initAudio('pkmrs-evolving.mid', 'bgm'),
    evolved: initAudio('xy_trainer_battle_victory.ogg', 'bgm'),
  },
});

const moveAudioFile = async (projectPath: string) => {
  const src = path.join(projectPath, 'audio/se/caughtjingle.ogg');
  const dest = path.join(projectPath, 'audio/me/caughtjingle.ogg');

  if (fs.existsSync(dest)) {
    await fsPromise.copyFile(dest, path.join(projectPath, 'audio/me/caughtjingle_old.ogg'));
  }

  if (fs.existsSync(src)) {
    await fsPromise.copyFile(src, dest);
    await fsPromise.unlink(src);
  }
};

export const addSoundDesignConfig = async (_: IpcMainEvent, projectPath: string) => {
  deletePSDKDatFile(projectPath);

  const rmxpSystem = await readRMXPSystem(projectPath);
  if (!rmxpSystem) {
    throw new Error('An error has occurred with the reading of « System.rxdata » file.');
  }

  const soundDesignConfig = initSoundDesignConfig(rmxpSystem);
  await moveAudioFile(projectPath);
  await fsPromise.writeFile(path.join(projectPath, 'Data/configs/sound_design_config.json'), JSON.stringify(soundDesignConfig, null, 2));
};
