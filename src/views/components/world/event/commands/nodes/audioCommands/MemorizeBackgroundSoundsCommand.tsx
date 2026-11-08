import { InputFormContainer } from '@components/inputs/InputContainer';
import {
  EVENT_COMMAND_MEMORIZE_BACKGROUND_SOUNDS_VALIDATOR,
  StudioEventCommandMemorizeBackgroundSounds,
} from '@modelEntities/event/audioCommands/memorizeBackgroundSounds';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import { TFunction } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const MEMORIZE_BACKGROUND_SOUNDS_EDITOR_SCHEMA = EVENT_COMMAND_MEMORIZE_BACKGROUND_SOUNDS_VALIDATOR.pick({ channels: true });

const updateCommandTitle = (channels: string[], t: TFunction) => {
  if (channels.includes('bgm') && channels.includes('bgs')) {
    return t('event_command_memorize_background_sounds');
  } else if (channels.includes('bgm')) {
    return t('event_command_memorize_bgm');
  } else if (channels.includes('bgs')) {
    return t('event_command_memorize_bgs');
  } else {
    return t('event_command_memorize_background_sounds');
  }
};

export const MemorizeBackgroundSoundsCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandMemorizeBackgroundSounds>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandMemorizeBackgroundSounds>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(MEMORIZE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, commandData);
  const { MultiSelect } = useNodeInputAttrsWithLabel(MEMORIZE_BACKGROUND_SOUNDS_EDITOR_SCHEMA, defaults);
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
          label={t('event_command_channels_to_memorize')}
          options={options}
          value={commandData.channels}
          className="nodrag nowheel"
        />
      </InputFormContainer>
    </CommandNode>
  );
};
