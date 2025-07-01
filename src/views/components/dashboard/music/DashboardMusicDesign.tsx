import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { AudioInput } from '@components/inputs';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import type { SoundEffectsKeys, SoundLocated } from '@modelEntities/config';
import { EditorsContainer } from './music.style';
import { AudioFile } from '@modelEntities/common';

interface SoundMapping {
  title: string;
  soundEffects: { key: SoundEffectsKeys; located: SoundLocated }[];
}

const MusicState: SoundMapping[] = [
  {
    title: 'interface',
    soundEffects: [{ key: 'gameOver', located: 'musicEffects' }],
  },
  {
    title: 'contextual',
    soundEffects: [
      { key: 'surf', located: 'backgroundMusic' },
      { key: 'acroBike', located: 'backgroundMusic' },
      { key: 'machBike', located: 'backgroundMusic' },
    ],
  },
  {
    title: 'combats',
    soundEffects: [
      { key: 'baseWildBattle', located: 'backgroundMusic' },
      { key: 'baseWildDefeat', located: 'backgroundMusic' },
      { key: 'defaultEye', located: 'backgroundMusic' },
      { key: 'baseTrainerBattle', located: 'backgroundMusic' },
      { key: 'baseTrainerDefeatBattle', located: 'backgroundMusic' },
    ],
  },
  {
    title: 'creatures',
    soundEffects: [
      { key: 'catchCreature', located: 'musicEffects' },
      { key: 'evolve', located: 'backgroundMusic' },
      { key: 'evolved', located: 'backgroundMusic' },
    ],
  },
];

export const DashboardMusicDesign = () => {
  const { t } = useTranslation();
  const { projectConfigValues: musicDesign, setProjectConfigValues: setMusicDesign } = useConfigSoundDesign();

  const musicState = useMemo(() => {
    return MusicState.map((state) => {
      return {
        ...state,
        soundEffects: state.soundEffects.map((soundEffect) => {
          const located = musicDesign?.[soundEffect.located];
          const audio = located?.[soundEffect.key as keyof typeof located] as AudioFile | undefined;
          return audio ? { ...soundEffect, ...audio } : null;
        }),
      };
    });
  }, [musicDesign]);

  console.log(musicDesign, musicState);

  return (
    <EditorsContainer>
      {musicState.map((state) => (
        <PageEditor key={state.title} editorTitle={t('music_default')} title={t(state.title)} canCollapse>
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
