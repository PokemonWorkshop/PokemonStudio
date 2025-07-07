import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { AudioInput } from '@components/inputs';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import type { SoundEffectsKeys, SoundLocated } from '@modelEntities/config';
import { EditorsContainer } from './music.style';
import { AudioFile } from '@modelEntities/common';
import { OtherResource } from '@components/resources';
import { EditButtonOnlyIcon } from '@components/buttons';
import { SoundEditorKeys, SoundEditorOverlay } from './editors/SoundEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useUpdateConfigMusic } from './ressoures/useUpdateConfigSound';

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
  const { projectConfigValues: musicDesign } = useConfigSoundDesign();
  const dialogsRef = useDialogsRef<SoundEditorKeys>();
  const [audioFile, setAudioFile] = useState<(AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) | null>(null);
  const { onResourceMusicsChoosen, onResourceMusicsClean } = useUpdateConfigMusic(musicDesign);

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

  const handleOpenEditor = (soundEffect: AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) => {
    setAudioFile(soundEffect);
    dialogsRef.current?.openDialog('music', false);
  };

  return (
    <EditorsContainer>
      {musicState.map((state) => (
        <PageEditor key={state.title} editorTitle={t('sound_default')} title={t(state.title)} canCollapse>
          {state.soundEffects.map((soundEffect) => (
            <OtherResource
              type="music"
              title={t(`${soundEffect?.key}`)}
              resourcePath={soundEffect?.name ?? ''}
              extensions={AUDIO_EXT}
              onResourceChoosen={(resourcePath: string) => {
                onResourceMusicsChoosen(resourcePath, soundEffect?.key as SoundEffectsKeys, soundEffect?.located as SoundLocated);
              }}
              onResourceClean={() => {
                if (soundEffect?.key) onResourceMusicsClean(soundEffect?.key as SoundEffectsKeys, soundEffect?.located as SoundLocated);
              }}
              key={soundEffect?.key}
              beforeButtons={
                <button>
                  <EditButtonOnlyIcon
                    onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                      e.stopPropagation();
                      if (soundEffect) {
                        handleOpenEditor(soundEffect as AudioFile & { key: SoundEffectsKeys; located: SoundLocated });
                      }
                    }}
                  />
                </button>
              }
            />
          ))}
        </PageEditor>
      ))}
      <SoundEditorOverlay ref={dialogsRef} audioFile={audioFile ?? undefined} />
    </EditorsContainer>
  );
};
