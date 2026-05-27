import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { SecondaryNoBackground } from '@components/buttons';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputFormContainer, PaddedInputContainer } from '@components/inputs/InputContainer';
import { EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR, PORTRAIT_VALIDATOR, StudioEventCommandShowMessage } from '@modelEntities/event/command';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';

const InfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const TitleContainer = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;
  padding: 0 16px;
  user-select: none;
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text100};

  & svg {
    color: ${({ theme }) => theme.colors.text400};
  }

  & svg:hover {
    color: ${({ theme }) => theme.colors.text100};
    cursor: pointer;
  }
`;

const SHOW_MESSAGE_EDITOR_SCHEMA = EVENT_COMMAND_SHOW_MESSAGE_VALIDATOR.pick({
  portraits: true,
});

export const ShowMessagePortraitsEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandShowMessage>(event, defaultCommandId);
  const nextKey = useRef(command.portraits.length);
  const [portraits, setPortraits] = useState(() => command.portraits.map((data, i) => ({ data, key: i })));
  const { canClose, getFormData, defaults, formRef } = useZodForm(SHOW_MESSAGE_EDITOR_SCHEMA, command);
  const { EmbeddedUnitInput, ResourceInput, Toggle } = useInputAttrsWithLabel(SHOW_MESSAGE_EDITOR_SCHEMA, defaults);
  const { t } = useTranslation();

  const addPortrait = () => setPortraits((prev) => [...prev, { data: PORTRAIT_VALIDATOR.parse({}), key: nextKey.current++ }]);
  const removePortrait = (index: number) => () => setPortraits((prev) => prev.filter((_, i) => i !== index));

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    updateCommand({ portraits: result.data.portraits });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t(`event_command_show_message`)}>
      <InputFormContainer ref={formRef} size="m">
        {portraits.map(({ key, data: portrait }, index) => (
          <React.Fragment key={key}>
            <TitleContainer>
              <span>{t('event_command_portait', { index: index + 1 })}</span>
              <DeleteIcon onClick={removePortrait(index)} />
            </TitleContainer>
            <PaddedInputContainer>
              <ResourceInput
                name={`portraits.${index}.image`}
                label={t('image')}
                extensions={['png']}
                filename={t('image')}
                destFolderToCopy="graphics/battlers"
              />
              <Toggle name={`portraits.${index}.isMirrored`} label={t('event_command_is_mirrored')} defaultChecked={portrait.isMirrored} />
              <InputContainer size="xxs">
                <EmbeddedUnitInput
                  name={`portraits.${index}.position`}
                  unit="px"
                  label={t('position')}
                  labelLeft={true}
                  defaultValue={portrait.position}
                />
                <InfoContainer>{t('event_command_position_info')}</InfoContainer>
              </InputContainer>
              <EmbeddedUnitInput name={`portraits.${index}.opacity`} label={t('opacity')} labelLeft={true} defaultValue={portrait.opacity} />
            </PaddedInputContainer>
          </React.Fragment>
        ))}
        <SecondaryNoBackground onClick={addPortrait}>
          <PlusIcon />
          <span>{t('event_command_add_portrait')}</span>
        </SecondaryNoBackground>
      </InputFormContainer>
    </Editor>
  );
});

ShowMessagePortraitsEditor.displayName = 'ShowMessagePortraitsEditor';
