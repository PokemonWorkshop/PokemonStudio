import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputFormContainer } from '@components/inputs/InputContainer';
import type { MultiSelectValidation } from '@ds/MultiSelect';
import type { StudioEventCommandStopSounds } from '@modelEntities/event/audioCommands/stopSounds';
import { EVENT_COMMAND_STOP_SOUNDS_VALIDATOR } from '@modelEntities/event/audioCommands/stopSounds';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const Info = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const STOP_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_STOP_SOUNDS_VALIDATOR.pick({
  channels: true,
  fadeTime: true,
});

export const StopSoundsEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandStopSounds>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(STOP_SOUNDS_EDITOR_SCHEMA, command);
  const { MultiSelect, EmbeddedUnitInput } = useInputAttrsWithLabel(STOP_SOUNDS_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const validationRef = useRef<MultiSelectValidation>(null);
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>(command.channels);

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
      { label: t('event_command_music_effects'), value: 'me' },
      { label: t('event_command_sound_effects'), value: 'se' },
    ];
  }, [t]);

  const canCloseEditor = () => {
    if (!validationRef.current?.validate()) return false;
    return canClose();
  };

  const onClose = () => {
    const result = canCloseEditor() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  return (
    <Editor type="edit" title={t('event_command_stop_sounds')}>
      <InputFormContainer ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <InputContainer size="xs">
          <MultiSelect
            name="channels"
            label={t('event_command_channels_to_stop')}
            options={options}
            value={selectedChannels}
            onChange={setSelectedChannels}
            validationRef={validationRef}
            required
          />
          {selectedChannels.includes('se') && <Info>{t(`event_command_stop_se_info`)}</Info>}
        </InputContainer>

        <InputContainer size="s">
          <EmbeddedUnitInput
            style={
              selectedChannels.includes('bgm') || selectedChannels.includes('bgs') || selectedChannels.includes('me')
                ? undefined
                : { display: 'none' }
            }
            name="fadeTime"
            label={t('event_command_fade_time')}
            labelLeft
            unit="s"
            required
          />
        </InputContainer>
      </InputFormContainer>
    </Editor>
  );
});

StopSoundsEditor.displayName = 'StopSoundsEditor';
