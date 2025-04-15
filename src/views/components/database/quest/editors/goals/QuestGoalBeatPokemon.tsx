import { InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import { SelectPokemon2 } from '@components/selects/SelectPokemon';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalBeatPokemon = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_quests']);
  const defaultCreature = objective.objectiveMethodArgs[0] === '__undef__' ? undefined : (objective.objectiveMethodArgs[0] as DbSymbol);
  const [hiddenByDefault, setHiddenByDefault] = useState(objective.hiddenByDefault);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('database_pokemon:pokemon')}</Label>
        <SelectPokemon2 name="select-pokemon" optionRef={refs.entityRef} defaultValue={defaultCreature} />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-beat-pokemon">{t('database_quests:amount')}</Label>
        <InputNumber2
          name="amount-beat-pokemon"
          ref={refs.valueRef}
          defaultValue={objective.objectiveMethodArgs[1] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="hidden-by-default">{t('hidden_default')}</Label>
        <Toggle
          ref={refs.valueRef}
          name="hidden-by-default"
          checked={hiddenByDefault}
          onChange={(event) => {
            objective.hiddenByDefault = event.target.checked;
            setHiddenByDefault(event.target.checked);
            checkIsValid?.();
          }}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
