import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { AudioFile } from '@modelEntities/common';
import { SoundLocated, SoundEffectsKeys } from '@modelEntities/config';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useConfigSoundDesign } from '@src/hooks/useProjectConfig';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useUpdateConfigMusic } from '../ressoures/useUpdateConfigSound';

const SOUND_EDITOR_SCHEMA = z.object({
  volume: z.number().min(0).max(100).default(100),
  pitch: z.number().min(0).max(100).default(100),
});

type DashbordSoundEditorProps = {
  audioFile: (AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) | undefined;
};

export const DashboardSoundEditor = forwardRef<EditorHandlingClose, DashbordSoundEditorProps>(({ audioFile }, ref) => {
  const { t } = useTranslation();
  const dialogsRef = useDialogsRef();
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(SOUND_EDITOR_SCHEMA, audioFile);
  const { EmbeddedUnitInput } = useInputAttrsWithLabel(SOUND_EDITOR_SCHEMA, defaults);
  const { projectConfigValues: soundDesign } = useConfigSoundDesign();
  const { onResourceUpdate } = useUpdateConfigMusic(soundDesign);

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };

  const onClose = () => {
    if (!canClose()) return;
    const result = getFormData().data;

    if (result && audioFile?.key) {
      onResourceUpdate(result, audioFile.key, audioFile.located);
    }
    return result;
  };

  useEditorHandlingClose(ref, onClose, canCloseEditor);

  return (
    <Editor type="edit" title={t(audioFile?.key ?? 'sound_effect')}>
      {audioFile && (
        <InputFormContainer ref={formRef}>
          <EmbeddedUnitInput name="volume" unit="%" label={t('volume_ingame')} labelLeft onInput={onInputTouched} />
          <EmbeddedUnitInput name="pitch" unit="%" label={t('tempo_ingame')} labelLeft onInput={onInputTouched} />
        </InputFormContainer>
      )}
    </Editor>
  );
});
DashboardSoundEditor.displayName = 'DashboardSoundEditor';
