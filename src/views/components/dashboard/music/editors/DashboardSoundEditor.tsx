import { Editor, useRefreshUI } from '@components/editor';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { Select } from '@ds/Select';
import { SelectOption } from '@ds/Select/types';
import { AudioFile } from '@modelEntities/common';
import { SoundLocated, SoundEffectsKeys, StudioTextConfig, StudioTextTtfFileConfig } from '@modelEntities/config';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useDialogsRef } from '@src/hooks/useDialogsRef';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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

  const canCloseEditor = () => {
    console.log('canCloseEditor', dialogsRef.current, canClose());
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    console.log('onClose', result);
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
