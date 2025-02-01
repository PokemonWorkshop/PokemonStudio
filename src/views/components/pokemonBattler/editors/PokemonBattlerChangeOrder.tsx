import { DarkButton, PrimaryButton } from '@components/buttons';
import { DataGrid } from '@components/database/dataBlocks';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer } from '@components/inputs';
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
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { useTrainerPage } from '@src/hooks/usePage';
import { useProjectPokemon } from '@src/hooks/useProjectData';
import { cloneEntity } from '@utils/cloneEntity';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import React, { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ResourceImage } from '@components/ResourceImage';
import { pokemonIconPath } from '@utils/path';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const ChangeOrderInfoContainer = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  white-space: pre-line;
  user-select: none;
`;

const ChangeOrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  user-select: none;

  .header:first-child {
    padding: 0 4px 12px 0;
    border-bottom: solid 1px ${({ theme }) => theme.colors.dark18};
  }
`;

type DataChangeOrderGridProps = {
  dragOn: boolean;
};

const DataChangeOrderGrid = styled(DataGrid).attrs<DataChangeOrderGridProps>((props) => ({
  'data-drag-off': !props.dragOn ? true : undefined,
}))<DataChangeOrderGridProps>`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  grid-template-columns: 18px 32px 84px auto;
  align-items: center;

  &[data-drag-off] {
    &:hover:not(.header) {
      background-color: ${({ theme }) => theme.colors.dark18};
      color: ${({ theme }) => theme.colors.text100};
      border-radius: 8px;
    }
  }

  & img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    object-position: 0 100%;
  }

  & .level {
    color: ${({ theme }) => theme.colors.text400};
    text-align: right;
  }
`;

type RenderBattlerContainerProps = {
  isDragging: boolean;
  dragOn: boolean;
};

const RenderBattlerContainer = styled(DataChangeOrderGrid).attrs<RenderBattlerContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderBattlerContainerProps>`
  box-sizing: border-box;
  height: 40px;
  padding: 0 8px 0 8px;
  margin: 0 -4px 0 -8px;
  box-shadow: ${({ theme, isDragging }) => (isDragging ? `0 0 5px ${theme.colors.dark8}` : 'none')};

  & span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  & .error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & .drag {
    color: ${({ theme }) => theme.colors.text700};
    height: 18px;

    :hover {
      cursor: grab;
    }
  }

  &[data-dragged] {
    background-color: ${({ theme }) => theme.colors.dark14};
    color: ${({ theme }) => theme.colors.text100};
    border-radius: 8px;
  }
`;

type RenderBattlerProps = {
  battler: StudioGroupEncounter;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
};

const RenderBattler = forwardRef<HTMLDivElement, RenderBattlerProps>(({ battler, provided, isDragging, dragOn }, ref) => {
  const { projectDataValues: species, state } = useProjectPokemon();
  const { t } = useTranslation();
  const specie = species[battler.specie];
  const creatureName = specie ? getEntityNameText(specie, state) : t('pokemon_deleted');
  const level = battler.levelSetup.kind === 'fixed' ? battler.levelSetup.level : 0;

  return (
    <RenderBattlerContainer
      gap="16px"
      ref={ref}
      {...provided.draggableProps}
      style={{
        ...provided.draggableProps.style,
      }}
      isDragging={isDragging}
      dragOn={dragOn}
    >
      <span className="drag" {...provided.dragHandleProps}>
        <DragIcon />
      </span>
      <span>
        {specie ? (
          <ResourceImage
            imagePathInProject={pokemonIconPath(specie, battler.form)}
            fallback={battler.form === 0 ? undefined : pokemonIconPath(specie)}
          />
        ) : (
          <ResourceImage imagePathInProject="graphics/pokedex/pokeicon/000.png" />
        )}
      </span>
      <span className={specie ? undefined : 'error'}>{creatureName}</span>
      <span className="level">{level}</span>
    </RenderBattlerContainer>
  );
});
RenderBattler.displayName = 'RenderBattler';

type PokemonBattlerChangeOrderProps = {
  closeDialog: () => void;
};

export const PokemonBattlerChangeOrder = forwardRef<EditorHandlingClose, PokemonBattlerChangeOrderProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation();
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const [party, setParty] = useState<StudioGroupEncounter[]>(cloneEntity(trainer.party));
  const [dragOn, setDragOn] = useState(false);

  const onClickSave = () => {
    updateTrainer({ party });
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type="reorganization" title={t('trainer_party')}>
      <InputContainer size="l">
        <InputContainer size="s">
          <ChangeOrderInfoContainer>{t('change_order_info')}</ChangeOrderInfoContainer>
          <ChangeOrderList>
            <DataChangeOrderGrid gap="16px" className="header" dragOn={dragOn}>
              <span />
              <span />
              <span>Pokémon</span>
              <span className="level">{t('level')}</span>
            </DataChangeOrderGrid>
            <DragDropContext
              onDragStart={() => setDragOn(true)}
              onDragEnd={(result: DropResult) => {
                setDragOn(false);
                const srcI = result.source.index;
                const desI = result.destination?.index;
                if (desI === undefined) return;

                const partyEdited = cloneEntity(party);
                partyEdited.splice(desI, 0, partyEdited.splice(srcI, 1)[0]);
                setParty(partyEdited);
              }}
            >
              <Droppable droppableId="droppable-pokemon-battler-changer-order">
                {(droppableProvided: DroppableProvided) => (
                  <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                    {party.map((battler, index) => (
                      <Draggable key={`creature-${index}`} draggableId={`draggable-battler-${index}`} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                          if (snapshot.isDragging) {
                            // Fix dragging item position
                            if (!provided.draggableProps.style) return;

                            const style = provided.draggableProps.style as DraggingStyle & { offsetLeft: number; offsetTop: number };
                            style.left = style.offsetLeft;
                            style.top = style.offsetTop;
                          }
                          return (
                            <RenderBattler
                              ref={provided.innerRef}
                              battler={battler}
                              provided={provided}
                              isDragging={snapshot.isDragging}
                              dragOn={dragOn}
                            />
                          );
                        }}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </ChangeOrderList>
        </InputContainer>
        <ButtonContainer>
          <PrimaryButton onClick={onClickSave}>{t('save')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
PokemonBattlerChangeOrder.displayName = 'PokemonBattlerChangeOrder';
