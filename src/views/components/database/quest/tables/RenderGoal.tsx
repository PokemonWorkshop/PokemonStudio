import React from 'react';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';
import { useTranslation } from 'react-i18next';
import { GoalCategory } from '@components/categories';
import { DataGoalGrid } from './QuestTableStyle';
import { ReactComponent as DragIcon } from '@assets/icons/global/drag.svg';
import { buildGoalText } from '@utils/QuestUtils';
import { useGlobalState } from '@src/GlobalStateProvider';
import { DeleteButtonOnlyIcon, EditButtonOnlyIcon } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import theme from '@src/AppTheme';
import { DraggableProvided } from 'react-beautiful-dnd';
import {
  StudioQuestObjective,
  StudioQuestObjectiveCategoryType,
  StudioQuestObjectiveType,
  StudioQuestCategoryClickable,
  StudioCreatureQuestCondition,
} from '@modelEntities/quest';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { usePokemonShortcutNavigation, useShortcutNavigation } from '@hooks/useShortcutNavigation';

type RenderGoalContainerProps = {
  isDragging: boolean;
  dragOn: boolean;
};

const RenderGoalContainer = styled(DataGoalGrid).attrs<RenderGoalContainerProps>((props) => ({
  'data-dragged': props.dragOn && props.isDragging ? true : undefined,
}))<RenderGoalContainerProps>`
  box-sizing: border-box;
  height: 40px;
  padding: 0 4px 0 8px;
  margin: 0 -4px 0 -8px;
  box-shadow: ${({ isDragging }) => (isDragging ? `0 0 5px ${theme.colors.dark8}` : 'none')};

  & span {
    color: ${({ theme }) => theme.colors.text400};
    text-transform: capitalize;
  }

  & .drag {
    color: ${theme.colors.text700};
    height: 18px;

    :hover {
      cursor: grab;
    }
  }

  & .buttons:nth-child(6) {
    display: flex;
    gap: 4px;
    justify-content: end;
    align-items: center;
    visibility: hidden;
  }

  &:hover {
    .buttons:nth-child(6) {
      visibility: ${({ dragOn }) => (dragOn ? `hidden` : 'visible')};
    }
  }

  &[data-dragged] {
    background-color: ${theme.colors.dark14};
    color: ${theme.colors.text100};
    border-radius: 8px;
  }

  & .clickable {
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }

  ${EditButtonOnlyIconContainer} {
    background-color: ${theme.colors.primarySoft};

    &:hover {
      background-color: ${theme.colors.secondaryHover};
    }

    &:active {
      background-color: ${theme.colors.primarySoft};
    }
  }

  @media ${theme.breakpoints.dataBox422} {
    grid-template-columns: 18px 25px 160px 104px auto;

    span:nth-child(4) {
      display: none;
    }
  }
`;

const categoryGoal: Record<StudioQuestObjectiveType, StudioQuestObjectiveCategoryType> = {
  objective_speak_to: 'interaction',
  objective_obtain_item: 'discovery',
  objective_see_pokemon: 'exploration',
  objective_beat_pokemon: 'battle',
  objective_catch_pokemon: 'battle',
  objective_beat_npc: 'battle',
  objective_obtain_egg: 'discovery',
  objective_hatch_egg: 'discovery',
};

const categoryClickable: Record<StudioQuestObjectiveType, StudioQuestCategoryClickable | null> = {
  objective_speak_to: null,
  objective_obtain_item: 'item',
  objective_see_pokemon: 'pokemon',
  objective_beat_pokemon: 'pokemon',
  objective_catch_pokemon: 'pokemon',
  objective_beat_npc: null,
  objective_obtain_egg: null,
  objective_hatch_egg: null,
};

type RenderGoalProps = {
  objective: StudioQuestObjective;
  index: number;
  provided: DraggableProvided;
  isDragging: boolean;
  dragOn: boolean;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

const RenderGoalChildren = ({ objective, texts, index }: { objective: StudioQuestObjective; texts: string[]; index: number }) => {
  let category = categoryClickable[objective.objectiveMethodName];
  let specificDbSymbol!: string | null;

  const determineIfQuestConditionIsClickable = (): boolean => {
    const initial = objective.objectiveMethodArgs[0];
    const objectif: StudioCreatureQuestCondition | string | number | unknown = initial && typeof initial === 'object' ? initial[index] : initial;

    if (texts[index] && typeof objectif === 'object' && (objectif as StudioCreatureQuestCondition)?.type) {
      switch ((objectif as StudioCreatureQuestCondition).type) {
        case 'pokemon':
          category = 'pokemon';
          specificDbSymbol = (objectif as StudioCreatureQuestCondition).value.toString();
          return true;
        case 'type':
          specificDbSymbol = (objectif as StudioCreatureQuestCondition).value.toString();
          category = 'type';
          return true;
        case 'nature':
        case 'minLevel':
        case 'maxLevel':
        case 'level':
        default:
          return false;
      }
    }

    if (texts[index] && typeof objectif === 'string') {
      specificDbSymbol = objectif;
      return true;
    }

    return false;
  };

  // If category is specific, we need to determine what's and where's the dbsymbol and if hes clickable
  const earningClickable: boolean = !!category && determineIfQuestConditionIsClickable();
  const isClickable: boolean = useKeyPress(CONTROL) && earningClickable && !texts.includes('???');
  const shortcutPokemonNavigation = usePokemonShortcutNavigation();
  const shortcutItemNavigation = useShortcutNavigation('items', 'item', '/database/items/');
  const shortcutTypeNavigation = useShortcutNavigation('types', 'type', '/database/types/');

  const shortcutToTheRightPlace = () => {
    if (!specificDbSymbol) return;
    if (category === 'type') {
      return shortcutTypeNavigation(specificDbSymbol);
    }
    if (category === 'pokemon') {
      // TODO implement form
      return shortcutPokemonNavigation(specificDbSymbol, 0);
    }

    if (category === 'item') {
      return shortcutItemNavigation(specificDbSymbol);
    }
  };

  return (
    <span onClick={isClickable ? () => shortcutToTheRightPlace() : undefined} className={`${isClickable ? 'clickable' : null}`}>
      {texts[index]}
      {texts.length !== index + 1 ? ', ' : ''}
    </span>
  );
};

export const RenderGoal = React.forwardRef<HTMLInputElement, RenderGoalProps>(
  ({ objective, index, provided, isDragging, dragOn, onClickEdit, onClickDelete }, ref) => {
    const [state] = useGlobalState();
    const { t } = useTranslation('database_quests');
    const objectiveText: string | Array<string> = buildGoalText(objective, state, t);

    return (
      <RenderGoalContainer
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
        <span>#{padStr(index + 1, 2)}</span>
        <span>{t(objective.objectiveMethodName)}</span>
        <GoalCategory category={categoryGoal[objective.objectiveMethodName]}>{t(categoryGoal[objective.objectiveMethodName])}</GoalCategory>
        <span>
          {typeof objectiveText === 'object' &&
            objectiveText.map((text, i) => <RenderGoalChildren key={text + i} index={i} texts={objectiveText} objective={objective} />)}
          {typeof objectiveText === 'string' && <RenderGoalChildren key={objectiveText} index={0} texts={[objectiveText]} objective={objective} />}
        </span>
        <div className="buttons">
          <EditButtonOnlyIcon size="s" color={theme.colors.primaryBase} onClick={onClickEdit} />
          <DeleteButtonOnlyIcon size="s" onClick={onClickDelete} />
        </div>
      </RenderGoalContainer>
    );
  }
);
RenderGoal.displayName = 'RenderGoal';
