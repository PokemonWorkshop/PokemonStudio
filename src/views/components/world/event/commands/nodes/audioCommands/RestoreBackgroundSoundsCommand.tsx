import { InputFormContainer } from '@components/inputs/InputContainer';
import {
  EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR,
  StudioEventCommandRestoreBackgroundSounds,
} from '@modelEntities/event/audioCommands/restoreBackgroundSounds';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR.pick({ channels: true });

export const RestoreBackgroundSoundsCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandRestoreBackgroundSounds>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandRestoreBackgroundSounds>;
  const { canClose, getFormData, defaults, formRef } = useZodForm(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [title, setTitle] = useState(t('event_command_restore_background_sounds'));

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
    ];
  }, [t]);

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  const updateCommandTitle = (channels: string[]) => {
    if (channels.includes('bgm') && channels.includes('bgs')) {
      setTitle(t('event_command_restore_background_sounds'));
    } else if (channels.includes('bgm')) {
      setTitle(t('event_command_restore_bgm'));
    } else if (channels.includes('bgs')) {
      setTitle(t('event_command_restore_bgs'));
    } else {
      setTitle(t('event_command_restore_background_sounds'));
    }
  };

  return (
    <CommandNode
      commandType={commandType}
      commentCount={comments.length}
      dialogsRef={dialogsRef}
      nodeId={id}
      selected={selected}
      titleOverride={title}
    >
      <InputFormContainer ref={formRef} onBlur={onBlur} key={id}>
        <MultiSelect
          name="channels"
          label={t('event_command_channels_to_restore')}
          options={options}
          value={commandData.channels}
          className="nodrag nowheel"
          onChange={(value) => updateCommandTitle(value)}
        />
      </InputFormContainer>
    </CommandNode>
  );
};
