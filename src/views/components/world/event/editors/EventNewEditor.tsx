import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useProjectEvents } from '@hooks/useProjectData';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { EVENT_NAME_TEXT_ID } from '../../../../../models/entities/event/event';
import { createEvent } from '../../../../../utils/entityCreation';
import { useEventTree } from '@hooks/useEventTree';
import { addNewEventToEventTree } from '@utils/events/EventUtils';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type EventNewEditorProps = {
  closeDialog: () => void;
};

export const EventNewEditor = forwardRef<EditorHandlingClose, EventNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: events, setProjectDataValues: setEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const { t } = useTranslation();
  const setText = useSetProjectText();
  const eventIndex = Object.keys(events).length ?? 0;
  const [name, setName] = useState(``); // We use a state because synchronizing dbSymbol is easier with a state

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!name) return;

    const dbSymbol = `event_${eventIndex}` as DbSymbol;
    const newEvent = createEvent(dbSymbol, eventIndex);
    setText(EVENT_NAME_TEXT_ID, newEvent.id, name);
    setEvent({ [dbSymbol]: { ...newEvent, klass: 'Event' } }, { event: dbSymbol });
    setEventTree(addNewEventToEventTree(eventTree, dbSymbol, eventIndex));
    closeDialog();
  };

  /**
   * Handle the change of name (also update dbSymbol if none were specified)
   */
  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  /**
   * Check if the entity cannot be created because of any validation error
   */
  const isDisabled = !name;

  return (
    <Editor type="creation" title={t('new_event')}>
      <InputFormContainer onSubmit={(e) => e.preventDefault()}>
        <InputWithTopLabelContainer>
          <Label required>{t('name')}</Label>
          <Input
            value={name}
            onChange={onChangeName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onClickNew();
            }}
            placeholder={t('example_event')}
          />
        </InputWithTopLabelContainer>

        <ButtonContainer>
          <TooltipWrapper data-tooltip={isDisabled ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={isDisabled}>
              {t('create_event')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
EventNewEditor.displayName = 'EventNewEditor';
