import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputFormContainer } from '@components/inputs/InputContainer';
import type { MultiSelectValidation } from '@ds/MultiSelect';
import type { StudioEventCommandRestoreBackgroundSounds } from '@modelEntities/event/audioCommands/restoreBackgroundSounds';
import { EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR } from '@modelEntities/event/audioCommands/restoreBackgroundSounds';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandEditor } from '../../../hooks/useCommandEditor';
import { EventEditorProps } from '../EventEditorProps';

const RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR.pick({ channels: true });

export const RestoreBackgroundSoundsEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandRestoreBackgroundSounds>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, command);
  const { MultiSelect } = useInputAttrsWithLabel(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const validationRef = useRef<MultiSelectValidation>(null);

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
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
    <Editor type="edit" title={t('event_command_restore_background_sounds')}>
      <InputFormContainer ref={formRef}>
        <MultiSelect
          name="channels"
          label={t('event_command_channels_to_restore')}
          options={options}
          value={command.channels}
          validationRef={validationRef}
          required
        />
      </InputFormContainer>
    </Editor>
  );
});

RestoreBackgroundSoundsEditor.displayName = 'RestoreBackgroundSoundsEditor';
