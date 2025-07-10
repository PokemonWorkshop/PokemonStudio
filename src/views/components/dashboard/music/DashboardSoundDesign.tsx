import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageEditor } from '@components/pages';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { SoundEffectsKeys, SoundLocated } from '@modelEntities/config';
import { EditorsContainer } from './music.style';
import { AudioFile } from '@modelEntities/common';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { OtherResource } from '@components/resources';
import { EditButtonOnlyIcon } from '@components/buttons';
import { useUpdateConfigMusic } from './ressoures/useUpdateConfigSound';
import { SoundEditorKeys, SoundEditorOverlay } from './editors/SoundEditorOverlay';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { TuneButtonOnlyIcon } from '@components/buttons/TuneButtonOnlyIcon';

interface SoundMapping {
  title: string;
  soundEffects: { key: SoundEffectsKeys; located: SoundLocated; translateKey?: string }[];
}

const SoundState: SoundMapping[] = [
  {
    title: 'interfaces',
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
      { key: 'shiny', located: 'soundEffects', translateKey: 'shinySee' },
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
  const dialogsRef = useDialogsRef<SoundEditorKeys>();
  const [audioFile, setAudioFile] = useState<(AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) | null>(null);

  const { projectConfigValues: soundDesign } = useConfigSoundDesign();
  const { onResourceMusicsChoosen, onResourceMusicsClean } = useUpdateConfigMusic(soundDesign);

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

  const handleOpenEditor = (soundEffect: AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) => {
    setAudioFile(soundEffect);
    dialogsRef.current?.openDialog('sound_effect', false);
  };

  return (
    <EditorsContainer>
      {soundState.map((state) => (
        <PageEditor key={state.title} editorTitle={t('sound_default')} title={t(state.title)} canCollapse>
          {state.soundEffects.map((soundEffect, index) => (
            <OtherResource
              type="music"
              title={t(`${soundEffect?.translateKey ?? soundEffect?.key}`)}
              resourcePath={soundEffect?.name ?? ''}
              extensions={AUDIO_EXT}
              onResourceChoosen={(resourcePath: string) => {
                onResourceMusicsChoosen(resourcePath, soundEffect?.key as SoundEffectsKeys, soundEffect?.located as SoundLocated);
              }}
              onResourceClean={() => {
                if (soundEffect?.key) onResourceMusicsClean(soundEffect?.key as SoundEffectsKeys, soundEffect?.located as SoundLocated);
              }}
              key={soundEffect?.key ?? index}
              beforeButtons={
                <button>
                  <TuneButtonOnlyIcon
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
