import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { EditorsContainer } from './music.style';
import { AudioFile } from '@modelEntities/common';
import { OtherResource } from '@components/resources';
import { SoundEditorKeys, SoundEditorOverlay, type SoundEffect } from './editors/SoundEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { getAudioName, useUpdateConfigMusic } from './ressoures/useUpdateConfigSound';
import { TuneButtonOnlyIcon } from '@components/buttons/TuneButtonOnlyIcon';

interface SoundMapping {
  title: string;
  soundEffects: SoundEffect[];
}

const MusicState: SoundMapping[] = [
  {
    title: 'interfaces',
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
    title: 'battles',
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
  const dialogsRef = useDialogsRef<SoundEditorKeys>();
  const [audioFile, setAudioFile] = useState<(AudioFile & SoundEffect) | null>(null);

  const { projectConfigValues: musicDesign } = useConfigSoundDesign();
  const { onResourceMusicsChoosen, onResourceMusicsClean } = useUpdateConfigMusic(musicDesign);

  const musicState = useMemo(() => {
    return MusicState.map((state) => {
      return {
        ...state,
        soundEffects: state.soundEffects.reduce<(SoundEffect & AudioFile)[]>((prev, soundEffect) => {
          const located = musicDesign?.[soundEffect.located];
          const audio = located?.[soundEffect.key as keyof typeof located] as AudioFile | undefined;
          if (!audio) return prev;

          return [...prev, { ...soundEffect, ...audio }];
        }, []),
      };
    });
  }, [musicDesign]);

  const handleOpenEditor = (soundEffect: AudioFile & SoundEffect) => {
    setAudioFile(soundEffect);
    dialogsRef.current?.openDialog('music', false);
  };

  return (
    <EditorsContainer>
      {musicState.map((state) => (
        <PageEditor key={state.title} editorTitle={t('music_default')} title={t(state.title)} canCollapse>
          {state.soundEffects.map((soundEffect) => (
            <OtherResource
              type="music"
              title={t(`${soundEffect.translateKey ?? soundEffect.key}`)}
              resourcePath={getAudioName(soundEffect.located, soundEffect.name)}
              extensions={AUDIO_EXT}
              onResourceChoosen={(resourcePath: string) => {
                onResourceMusicsChoosen(resourcePath, soundEffect.key, soundEffect.located);
              }}
              onResourceClean={() => {
                onResourceMusicsClean(soundEffect.key, soundEffect.located);
              }}
              key={soundEffect.key}
              beforeButtons={
                <button>
                  <TuneButtonOnlyIcon
                    onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
                      e.stopPropagation();
                      handleOpenEditor(soundEffect);
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
