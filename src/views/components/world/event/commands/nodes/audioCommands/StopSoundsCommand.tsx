import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_STOP_SOUNDS_VALIDATOR, StudioEventCommandStopSounds } from '@modelEntities/event/audioCommands/stopSounds';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import { TFunction } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const STOP_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_STOP_SOUNDS_VALIDATOR.pick({ channels: true });

const updateCommandTitle = (channels: string[], t: TFunction) => {
  if (channels.length === 1) {
    const channel = channels[0];
    return t(`event_command_stop_${channel}`);
  } else {
    return t('event_command_stop_sounds');
  }
};

export const StopSoundsCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandStopSounds>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandStopSounds>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(STOP_SOUNDS_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(STOP_SOUNDS_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [title, setTitle] = useState(updateCommandTitle(commandData.channels, t));

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
      { label: t('event_command_music_effects'), value: 'me' },
      { label: t('event_command_sound_effects'), value: 'se' },
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
          label={t('event_command_channels_to_stop')}
          options={options}
          value={commandData.channels}
          className="nodrag nowheel"
        />
      </InputFormContainer>
    </CommandNode>
  );
};
