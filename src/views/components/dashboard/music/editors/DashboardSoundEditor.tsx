import { Editor, useRefreshUI } from '@components/editor';
import { TranslationEditorWithCloseHandling } from '@components/editor/TranslationEditorWithCloseHandling';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { Select } from '@ds/Select';
import { SelectOption } from '@ds/Select/types';
import { AudioFile } from '@modelEntities/common';
import { SoundLocated, SoundEffectsKeys, StudioTextConfig, StudioTextTtfFileConfig } from '@modelEntities/config';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const SOUND_EDITOR_SCHEMA = z.object({
  volume: z.number().min(0).max(100).default(100),
  pitch: z.number().min(0).max(100).default(100),
});

type DashbordSoundEditorProps = {
  audioFile: AudioFile & { key: SoundEffectsKeys; located: SoundLocated };
  onClose: () => void;
};

export const DashboardSoundEditor = ({ audioFile }: DashbordSoundEditorProps) => {
  const { t } = useTranslation();
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(SOUND_EDITOR_SCHEMA, audioFile);
  const { EmbeddedUnitInput } = useInputAttrsWithLabel(SOUND_EDITOR_SCHEMA, defaults);

  return (
    <Editor type="edit" title={t(audioFile.key)}>
      <InputFormContainer ref={formRef}>
        <EmbeddedUnitInput name="volume" unit="%" label={t('volume_ingame')} labelLeft onInput={onInputTouched} />
        <EmbeddedUnitInput name="pitch" unit="%" label={t('tempo_ingame')} labelLeft onInput={onInputTouched} />
      </InputFormContainer>
    </Editor>
  );
};
