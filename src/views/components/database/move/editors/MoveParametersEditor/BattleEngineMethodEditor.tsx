import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MOVE_BATTLE_ENGINE_METHODS, StudioMove } from '@modelEntities/move';
import { Input } from '@components/inputs/Input';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { Select } from '@ds/Select/Select';

const BattleEngineMethodEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type BattleEngineMethodEditorProps = {
  move: StudioMove;
  options: SelectOption[];
  getRawFormData: () => Record<string, unknown>;
  defaults: Record<string, unknown>;
};

export const BattleEngineMethodEditor = ({ move, options, getRawFormData, defaults }: BattleEngineMethodEditorProps) => {
  const { t } = useTranslation('database_moves');
  const [isCustom, setIsCustom] = useState(!(MOVE_BATTLE_ENGINE_METHODS as ReadonlyArray<string>).includes(String(defaults.battleEngineMethod)));
  const [defaultInputValue, setDefaultInputValue] = useState(String(defaults.battleEngineMethod));

  const battleEngineMethod = String(getRawFormData().battleEngineMethod ?? defaults.battleEngineMethod);

  const onChange = (value: string) => {
    const isCustom = value === '__custom__';
    if (isCustom) setDefaultInputValue(`s_${move.dbSymbol}`);
    setIsCustom(isCustom);
  };

  return (
    <BattleEngineMethodEditorContainer>
      <InputWithTopLabelContainer>
        <Label>{t('procedure')}</Label>
        <Select
          name={isCustom ? '__ignore__' : 'battleEngineMethod'}
          options={options}
          onChange={onChange}
          value={isCustom ? '__custom__' : battleEngineMethod}
          defaultValue={String(defaults.battleEngineMethod)}
        />
      </InputWithTopLabelContainer>
      {isCustom && (
        <InputWithTopLabelContainer>
          <Label required>{t('function')}</Label>
          <Input name={isCustom ? 'battleEngineMethod' : '__ignore__'} pattern="^[a-z_][a-z0-9_]+$" defaultValue={defaultInputValue} />
        </InputWithTopLabelContainer>
      )}
    </BattleEngineMethodEditorContainer>
  );
};
