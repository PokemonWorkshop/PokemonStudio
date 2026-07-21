import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import DragIcon from '@assets/icons/global/drag.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { DeleteNoBackground, SecondaryNoBackground } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, Label } from '@components/inputs';
import { InputContainer, InputFormContainer } from '@components/inputs/InputContainer';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
  Droppable,
  DroppableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { EVENT_COMMAND_SHOW_CHOICE_VALIDATOR, StudioEventCommandShowChoice } from '@modelEntities/event/command';
import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import { useZodForm } from '@src/hooks/useZodForm';
import { findMultipleAvailableTextIdsEvent } from '@utils/ModelUtils';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useCommandEditor } from '../../hooks/useCommandEditor';
import { EventEditorProps } from './EventEditorProps';
import { ShowChoiceEditorTitle, ShowChoiceOverlay } from './ShowChoiceOverlay';

const SHOW_CHOICE_EDITOR_SCHEMA = EVENT_COMMAND_SHOW_CHOICE_VALIDATOR.pick({
  choicePosition: true,
  resultVariable: true,
});

const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  user-select: none;
`;

type ChoiceRowContainerProps = {
  isDragging: boolean;
};

const ChoiceRowContainer = styled.div<ChoiceRowContainerProps>`
  display: grid;
  grid-template-columns: 18px 1fr 32px;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px;
  margin: 0 -4px 8px -8px;
  box-shadow: ${({ theme, isDragging }) => (isDragging ? `0 0 5px ${theme.colors.dark8}` : 'none')};
  background-color: ${({ theme, isDragging }) => (isDragging ? theme.colors.dark14 : 'transparent')};
  border-radius: ${({ isDragging }) => (isDragging ? '8px' : '0')};

  & .drag {
    color: ${({ theme }) => theme.colors.text700};
    height: 18px;

    :hover {
      cursor: grab;
    }
  }
`;

export const ShowChoiceEditor = forwardRef<EditorHandlingClose, EventEditorProps>(({ commandId: defaultCommandId, event }, ref) => {
  const { command, updateCommand } = useCommandEditor<StudioEventCommandShowChoice>(event, defaultCommandId);
  const { canClose, getFormData, defaults, formRef } = useZodForm(SHOW_CHOICE_EDITOR_SCHEMA, command, (data) => ({
    ...data,
    resultVariable: Number(data.resultVariable),
  }));
  const { Select } = useInputAttrsWithLabel(SHOW_CHOICE_EDITOR_SCHEMA, defaults);
  const dialogsRef = useDialogsRef<ShowChoiceEditorTitle>();
  const { t } = useTranslation();
  const getText = useGetProjectText();
  const setText = useSetProjectText();
  const [choices, setChoices] = useState<number[]>(() => [...command.choices]);
  const [currentChoiceTextId, setCurrentChoiceTextId] = useState<number | undefined>(undefined);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // TODO: Fill with real data when variables are implemented
  const variableOptions = useMemo(
    () => [
      { value: '26', label: 'VAR026: Temp_1' },
      { value: '27', label: 'VAR027: Temp_2' },
    ],
    [],
  );
  const positionOptions = useMemo(
    () => [
      { value: 'bottom', label: t('bottom') },
      { value: 'top', label: t('top') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;

    return canClose();
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    const data = result.data;
    choices.forEach((textId, index) => {
      const input = inputRefs.current[index];
      if (input) setText(event.csvFileId, textId, input.value);
    });
    updateCommand({ ...data, choices });
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  const onShowChoiceOverlayClose = () => {
    if (currentChoiceTextId === undefined) return;
    const idx = choices.indexOf(currentChoiceTextId);
    if (idx !== -1 && inputRefs.current[idx]) {
      inputRefs.current[idx]!.value = inputRefs.current[idx]!.defaultValue;
    }
  };

  const handleTranslateChoice = (textId: number, index: number) => () => {
    const input = inputRefs.current[index];
    if (input) setText(event.csvFileId, textId, input.value);
    setCurrentChoiceTextId(textId);
    setTimeout(() => dialogsRef.current?.openDialog('translation_choice'), 0);
  };

  const handleDeleteChoice = (index: number) => () => {
    const updated = [...choices];
    updated.splice(index, 1);
    inputRefs.current.splice(index, 1);
    setChoices(updated);
  };

  const handleAddChoice = () => {
    const [newId] = findMultipleAvailableTextIdsEvent(event, 0, 1, choices);
    setText(event.csvFileId, newId, '');
    setChoices([...choices, newId]);
  };

  return (
    <EditorWithCollapse type="edit" title={t(`event_command_show_choice`)}>
      <InputFormContainer ref={formRef} size="m">
        <InputContainer size="xs">
          <Label>{t('event_command_choices')}</Label>
          <ChoiceList>
            <DragDropContext
              onDragEnd={(result: DropResult) => {
                const srcIndex = result.source.index;
                const destIndex = result.destination?.index;
                if (destIndex === undefined) return;

                const reordered = [...choices];
                reordered.splice(destIndex, 0, reordered.splice(srcIndex, 1)[0]);
                setChoices(reordered);
              }}
            >
              <Droppable droppableId="droppable-show-choice-editor">
                {(droppableProvided: DroppableProvided) => (
                  <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                    {choices.map((textId, index) => (
                      <Draggable key={`choice-${textId}`} draggableId={`choice-${textId}`} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                          if (snapshot.isDragging) {
                            if (!provided.draggableProps.style) return;

                            const style = provided.draggableProps.style as DraggingStyle & { offsetLeft: number; offsetTop: number };
                            style.left = style.offsetLeft;
                            style.top = style.offsetTop;
                          }
                          return (
                            <ChoiceRowContainer
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{ ...provided.draggableProps.style }}
                              isDragging={snapshot.isDragging}
                            >
                              <span className="drag" {...provided.dragHandleProps}>
                                <DragIcon />
                              </span>
                              <TranslateInputContainer onTranslateClick={handleTranslateChoice(textId, index)}>
                                <Input
                                  type="text"
                                  defaultValue={getText(event.csvFileId, textId)}
                                  ref={(r) => {
                                    inputRefs.current[index] = r;
                                  }}
                                />
                              </TranslateInputContainer>
                              <DeleteNoBackground disabled={choices.length <= 2} onClick={handleDeleteChoice(index)}>
                                <DeleteIcon />
                              </DeleteNoBackground>
                            </ChoiceRowContainer>
                          );
                        }}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <SecondaryNoBackground onClick={handleAddChoice}>
              <PlusIcon />
              {t('event_command_add_choice')}
            </SecondaryNoBackground>
          </ChoiceList>
        </InputContainer>
        <InputContainer size="s">
          <Select name="resultVariable" label={t('event_command_result_variable')} options={variableOptions} />
          <Select name="choicePosition" label={t('event_command_choice_position')} options={positionOptions} />
        </InputContainer>
      </InputFormContainer>
      <ShowChoiceOverlay csvFileId={event.csvFileId} choiceIndex={currentChoiceTextId} onClose={onShowChoiceOverlayClose} ref={dialogsRef} />
    </EditorWithCollapse>
  );
});

ShowChoiceEditor.displayName = 'ShowChoiceEditor';
