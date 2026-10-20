import { InputFormContainer } from '@components/inputs/InputContainer';
import {
  EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR,
  StudioEventCommandRestoreBackgroundSounds,
} from '@modelEntities/event/audioCommands/restoreBackgroundSounds';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import { TFunction } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_RESTORE_BACKGROUND_SOUNDS_VALIDATOR.pick({ channels: true });

const updateCommandTitle = (channels: string[], t: TFunction) => {
  if (channels.includes('bgm') && channels.includes('bgs')) {
    return t('event_command_restore_background_sounds');
  } else if (channels.includes('bgm')) {
    return t('event_command_restore_bgm');
  } else if (channels.includes('bgs')) {
    return t('event_command_restore_bgs');
  } else {
    return t('event_command_restore_background_sounds');
  }
};

export const RestoreBackgroundSoundsCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandRestoreBackgroundSounds>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandRestoreBackgroundSounds>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(RESTORE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [title, setTitle] = useState(updateCommandTitle(commandData.channels, t));

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

  useEffect(() => {
    reload(commandData);
    setTitle(updateCommandTitle(commandData.channels, t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandData]);

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
        />
      </InputFormContainer>
    </CommandNode>
  );
};
