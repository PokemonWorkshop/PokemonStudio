import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { DropInput, FileInput, InputWithTopLabelContainer, Label } from '@components/inputs';
import { AUDIO_EXT } from '@components/inputs/AudioInput';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_PLAY_SOUND_VALIDATOR, StudioEventCommandPlaySound } from '@modelEntities/event/audioCommands/playSound';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import { basename } from '@utils/path';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const PLAY_SOUND_EDITOR_SCHEMA = EVENT_COMMAND_PLAY_SOUND_VALIDATOR.pick({ channel: true, filename: true, volume: true, pitch: true });

export const PlaySoundEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandPlaySound>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(PLAY_SOUND_EDITOR_SCHEMA, command);
  const { EmbeddedUnitInput, Input, Select } = useInputAttrsWithLabel(PLAY_SOUND_EDITOR_SCHEMA, defaults);
  const [{ projectPath }] = useGlobalState();
  const { t } = useTranslation();
  const [filename, setFilename] = useState(defaults['filename']);
  const filenameRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
      { label: t('event_command_music_effect'), value: 'me' },
      { label: t('event_command_sound_effect'), value: 'se' },
    ];
  }, [t]);

  const onChangeSound = (filepath: string) => {
    if (!filenameRef.current || !projectPath) return;

    // TODO: doesn't work because the implemented copy logic does not take subfolders into account
    /*console.log(filepath);
    const newFilename = filepath.replaceAll(projectPath, '');
    console.log(newFilename);*/
    const newFilename = basename(filepath);
    setFilename(newFilename);
    filenameRef.current.value = newFilename;
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('event_command_play_sound')}>
      <InputFormContainer ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <Select name="channel" label={t(`event_command_channel_to_play`)} options={options} />
        <Input name="filename" ref={filenameRef} style={{ display: 'none' }} />
        <InputWithTopLabelContainer>
          <Label required>{t('event_command_audio_file')}</Label>
          {!filename ? (
            <DropInput
              name={t('event_command_audio_file')}
              extensions={AUDIO_EXT}
              destFolderToCopy="audio"
              onFileChoosen={(filePath) => onChangeSound(filePath)}
            />
          ) : (
            <FileInput
              filePath={`audio/${filename}`}
              name={t('event_command_audio_file')}
              extensions={AUDIO_EXT}
              onFileChoosen={(filePath) => onChangeSound(filePath)}
              onFileClear={() => onChangeSound('')}
              noIcon
            />
          )}
        </InputWithTopLabelContainer>
        <EmbeddedUnitInput name="volume" label={t('volume')} labelLeft unit="%" />
        <EmbeddedUnitInput name="pitch" label={t('pitch')} labelLeft unit="%" />
      </InputFormContainer>
    </Editor>
  );
});

PlaySoundEditor.displayName = 'PlaySoundEditor';
