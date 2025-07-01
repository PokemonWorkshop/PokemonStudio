import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { SoundEffectsKeys, SoundLocated } from '@modelEntities/config';
import { EditorsContainer } from './music.style';
import { AudioFile } from '@modelEntities/common';
import { AudioInput } from '@components/inputs';
import { AUDIO_EXT } from '@components/inputs/AudioInput';

interface SoundMapping {
  title: string;
  soundEffects: { key: SoundEffectsKeys; located: SoundLocated }[];
}

const SoundState: SoundMapping[] = [
  {
    title: 'interface',
    soundEffects: [
      { key: 'decision', located: 'soundEffects' },
      { key: 'cancel', located: 'soundEffects' },
      { key: 'buzzer', located: 'soundEffects' },
      { key: 'save', located: 'soundEffects' },
      { key: 'load', located: 'soundEffects' },
      { key: 'cursor', located: 'soundEffects' },
      { key: 'shop', located: 'soundEffects' },
      { key: 'buy', located: 'soundEffects' },
      { key: 'pcStart', located: 'soundEffects' },
      { key: 'pcShutdown', located: 'soundEffects' },
      { key: 'questProgression', located: 'musicEffects' },
    ],
  },
  {
    title: 'interactions',
    soundEffects: [
      { key: 'jump', located: 'soundEffects' },
      { key: 'bump', located: 'soundEffects' },
    ],
  },
  {
    title: 'combats',
    soundEffects: [
      { key: 'battleStart', located: 'soundEffects' },
      { key: 'defaultExclamation', located: 'soundEffects' },
      { key: 'escape', located: 'soundEffects' },
      { key: 'ability', located: 'soundEffects' },
      { key: 'megaEvolve', located: 'soundEffects' },
      { key: 'moveEffective', located: 'soundEffects' },
      { key: 'moveVeryEffective', located: 'soundEffects' },
      { key: 'moveNotVeryEffective', located: 'soundEffects' },
      { key: 'shiny', located: 'soundEffects' },
      { key: 'statRiseUp', located: 'soundEffects' },
      { key: 'statFallDown', located: 'soundEffects' },
      { key: 'sendingBall', located: 'soundEffects' },
      { key: 'openingBall', located: 'soundEffects' },
      { key: 'backBall', located: 'soundEffects' },
      { key: 'actorCollapse', located: 'soundEffects' },
      { key: 'enemyCollapse', located: 'soundEffects' },
    ],
  },
  {
    title: 'creatures',
    soundEffects: [
      { key: 'receivedCreature', located: 'musicEffects' },
      { key: 'eggMove', located: 'soundEffects' },
      { key: 'levelUp', located: 'musicEffects' },
      { key: 'experienceGain', located: 'soundEffects' },
    ],
  },
  {
    title: 'objects',
    soundEffects: [
      { key: 'receiveItem', located: 'musicEffects' },
      { key: 'receiveKeyItem', located: 'musicEffects' },
      { key: 'receiveBerry', located: 'musicEffects' },
      { key: 'obtainBadge', located: 'musicEffects' },
    ],
  },
];
export const DashboardSoundDesign = () => {
  const { t } = useTranslation();
  const { projectConfigValues: soundDesign, setProjectConfigValues: setSoundDesign } = useConfigSoundDesign();

  const soundState = useMemo(() => {
    return SoundState.map((state) => {
      return {
        ...state,
        soundEffects: state.soundEffects.map((soundEffect) => {
          const located = soundDesign?.[soundEffect.located];
          const audio = located?.[soundEffect.key as keyof typeof located] as AudioFile | undefined;
          return audio ? { ...soundEffect, ...audio } : null;
        }),
      };
    });
  }, [soundDesign]);

  console.log(soundDesign, soundState);
  return (
    <EditorsContainer>
      {soundState.map((state) => (
        <PageEditor key={state.title} editorTitle={t('sound_default')} title={t(state.title)} canCollapse>
          {state.soundEffects.map((soundEffect) => (
            <div key={soundEffect?.key}>
              {t(soundEffect?.key ?? '')}
              <AudioInput
                key={soundEffect?.key}
                audioPathInProject={soundEffect?.name ?? ''}
                destFolderToCopy="audio/sound"
                name={t(soundEffect?.key ?? '')}
                extensions={AUDIO_EXT}
                onAudioChoosen={(path) => {
                  console.log(path);
                }}
                onAudioClear={() => {
                  console.log('clear');
                }}
              />
            </div>
          ))}
        </PageEditor>
      ))}
    </EditorsContainer>
  );
};
