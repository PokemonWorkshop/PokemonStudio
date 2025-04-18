import { DbSymbol } from '@modelEntities/dbSymbol';
import { QUEST_CUSTOM_OBJECTIVE_TEXT_ID, StudioCreatureQuestCondition, StudioQuestObjective, StudioQuestObjectiveType } from '@modelEntities/quest';
import { ProjectData } from '@src/GlobalStateProvider';
import { useConfigSettings } from '@src/hooks/useProjectConfig';
import { useProjectData } from '@src/hooks/useProjectData';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cloneEntity } from '@utils/cloneEntity';
import { createQuestObjective } from '@utils/entityCreation';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { useEffect, useRef, useState } from 'react';

const initializeObjective = (quests: ProjectData['quests'], initialObjective?: StudioQuestObjective): StudioQuestObjective => {
  return initialObjective ? cloneEntity(initialObjective) : createQuestObjective('objective_speak_to', quests);
};

export const useObjectiveQuest = (initialObjective?: StudioQuestObjective) => {
  const { projectDataValues: quests } = useProjectData('quests', 'quest');
  const [objective, setObjective] = useState(initializeObjective(quests, initialObjective));
  const [isValid, setIsValid] = useState<boolean>(false);
  const { projectConfigValues: settings } = useConfigSettings();
  const setText = useSetProjectText();
  const entityRef = useRef<DbSymbol | undefined>();
  const nameRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const hiddenByDefaultRef = useRef<HTMLInputElement>(null);
  const customObjectiveRef = useRef<HTMLTextAreaElement>(null);

  const checkConditionsIsValid = () => {
    return objective.objectiveMethodArgs.reduce((prev, arg) => {
      if (typeof arg === 'number' || typeof arg === 'string') return prev;

      const conditions = arg as StudioCreatureQuestCondition[];
      return (
        prev &&
        conditions.reduce((conditionsIsValid, condition) => {
          const type = condition.type;
          if (type === 'level' || type === 'maxLevel' || type === 'minLevel') {
            const result = condition.value > 0 && condition.value <= settings.pokemonMaxLevel;
            return conditionsIsValid && result;
          }
          return conditionsIsValid;
        }, true)
      );
    }, true);
  };

  const checkIsValid = () => {
    let result = false;
    switch (objective.objectiveMethodName) {
      case 'objective_speak_to':
        result = !!nameRef.current && nameRef.current.value !== '';
        break;
      case 'objective_beat_npc':
        result =
          !!nameRef.current &&
          !!valueRef.current &&
          !!hiddenByDefaultRef.current &&
          nameRef.current.value !== '' &&
          valueRef.current.validity.valid &&
          hiddenByDefaultRef.current.checked;
        break;
      case 'objective_obtain_item':
      case 'objective_beat_pokemon':
        result = !!entityRef.current && !!valueRef.current && valueRef.current.validity.valid;
        break;
      case 'objective_obtain_egg':
      case 'objective_hatch_egg':
        result = !!valueRef.current && valueRef.current.validity.valid;
        break;
      case 'objective_catch_pokemon':
        result = !!valueRef.current && valueRef.current.validity.valid && checkConditionsIsValid();
        break;
      case 'objective_see_pokemon':
        result = !!entityRef.current;
        break;
      case 'objective_custom':
        result = !!customObjectiveRef.current && customObjectiveRef.current.value !== '';
        break;
      default:
        assertUnreachable(objective.objectiveMethodName);
    }
    setIsValid(result);
    return result;
  };

  const updateObjective = (objectiveMethod: StudioQuestObjectiveType) => {
    const newObjective = createQuestObjective(objectiveMethod, quests);

    if (objectiveMethod === 'objective_custom') {
      const textId = newObjective.objectiveMethodArgs[1] as number;
      setText(QUEST_CUSTOM_OBJECTIVE_TEXT_ID, textId, '');
      setTimeout(() => setObjective(newObjective));
      return;
    }

    setObjective(newObjective);
  };

  useEffect(() => {
    setIsValid(checkIsValid());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective]);

  return {
    objective,
    refs: {
      entityRef,
      nameRef,
      valueRef,
      customObjectiveRef,
      hiddenByDefaultRef,
    },
    setObjective,
    updateObjective,
    checkIsValid,
    isValid,
  };
};
