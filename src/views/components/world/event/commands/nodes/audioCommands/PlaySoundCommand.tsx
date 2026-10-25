import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_PLAY_SOUND_VALIDATOR, StudioEventCommandPlaySound } from '@modelEntities/event/audioCommands/playSound';
import type { StudioEventCommandData } from '@modelEntities/event/command';
import { useNodeInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommandNode } from '../../../hooks/useCommandNode';
import { CommandNodeProps } from '../../CommandNodeProps';

const PLAY_SOUND_EDITOR_SCHEMA = EVENT_COMMAND_PLAY_SOUND_VALIDATOR.pick({ channel: true });

export const PlaySoundCommand = ({ id, data: { dialogsRef, command, comments }, selected }: CommandNodeProps) => {
  const { CommandNode, updateCommand } = useCommandNode<StudioEventCommandPlaySound>(id);
  const { type: commandType, ...commandData } = command as StudioEventCommandData<StudioEventCommandPlaySound>;
  const { canClose, getFormData, reload, defaults, formRef } = useZodForm(PLAY_SOUND_EDITOR_SCHEMA, commandData);
  const { Select } = useNodeInputAttrsWithLabel(PLAY_SOUND_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();
  const [channel, setChannel] = useState(defaults['channel']);

  const options = useMemo(() => {
    return [
      { label: t('event_command_background_music'), value: 'bgm' },
      { label: t('event_command_background_sounds'), value: 'bgs' },
      { label: t('event_command_music_effect'), value: 'me' },
      { label: t('event_command_sound_effect'), value: 'se' },
    ];
  }, [t]);

  const onBlur = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand(result.data);
  };

  useEffect(() => {
    reload(commandData);
    setChannel(commandData['channel']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);

  return (
    <CommandNode
      commandType={commandType}
      commentCount={comments.length}
      dialogsRef={dialogsRef}
      nodeId={id}
      selected={selected}
      titleOverride={t(`event_command_play_${channel}`)}
    >
      <InputFormContainer ref={formRef} onBlur={onBlur}>
        <Select
          name="channel"
          label={t('event_command_channel_to_play')}
          options={options}
          onChange={(value) => setChannel(value)}
          value={channel}
          defaultValue={undefined}
        />
      </InputFormContainer>
    </CommandNode>
  );
};
