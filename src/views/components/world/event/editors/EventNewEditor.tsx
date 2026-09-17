import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useEventTree } from '@components/world/event/hooks/useEventTree';
import { TooltipWrapper } from '@ds/Tooltip';
import { useProjectEvents } from '@hooks/useProjectData';
import { EVENT_NAME_TEXT_ID } from '@modelEntities/event/event';
import { DEFAULT_EVENT_TREE, StudioEventTreeFolder } from '@modelEntities/event/event-tree';
import { createEvent } from '@utils/entityCreation';
import { addNewEventToEventTree } from '@utils/events/EventTreeUtils';
import { useNewProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type EventNewEditorProps = {
  closeDialog: () => void;
  eventParent?: StudioEventTreeFolder;
};

export const EventNewEditor = forwardRef<EditorHandlingClose, EventNewEditorProps>(({ closeDialog, eventParent }, ref) => {
  const { projectDataValues: events, setProjectDataValues: setEvent } = useProjectEvents();
  const { eventTree, setEventTree } = useEventTree();
  const { t } = useTranslation();
  const setText = useSetProjectText();
  const setNewProjectText = useNewProjectText();
  const [name, setName] = useState(``); // We use a state because synchronizing dbSymbol is easier with a state

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!name) return;

    const newEvent = createEvent(events);
    const currentEventTree = eventTree ?? DEFAULT_EVENT_TREE;
    const dbSymbol = newEvent.dbSymbol;
    if (eventParent) {
      setEventTree(addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id, eventParent.data.dbSymbol));
    } else {
      setEventTree(addNewEventToEventTree(currentEventTree, dbSymbol, newEvent.id));
    }
    setText(EVENT_NAME_TEXT_ID, newEvent.id, name);
    setNewProjectText(newEvent.csvFileId);
    setEvent({ [dbSymbol]: { ...newEvent, klass: 'Event' } }, { event: dbSymbol });
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
