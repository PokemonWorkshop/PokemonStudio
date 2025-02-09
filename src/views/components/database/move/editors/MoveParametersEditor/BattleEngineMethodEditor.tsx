import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { StudioMove } from '@modelEntities/move';
import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomWithInput } from '@components/SelectCustom/SelectCustomWithInput';

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
  const [defaultInputValue, setDefaultInputValue] = useState(String(defaults.battleEngineMethod));

  const battleEngineMethod = String(getRawFormData().battleEngineMethod ?? defaults.battleEngineMethod);

  const onChange = (value: string) => {
    if (value === 'custom') setDefaultInputValue(`s_${move.dbSymbol}`);
  };

  return (
    <BattleEngineMethodEditorContainer>
      <InputWithTopLabelContainer>
        <Label>{t('procedure')}</Label>
        <SelectCustomWithInput
          value={battleEngineMethod}
          selectCustomLabel={t('move_custom')}
          zodFormName="battleEngineMethod"
          onSelectValueChange={onChange}
          inputLabel={t('function')}
          inputPattern="^[a-z_][a-z0-9_]+$"
          defaultCustomValue={defaultInputValue}
          setCustomValue={setDefaultInputValue}
          selectOptions={options}
          isTopLabel={true}
        />
      </InputWithTopLabelContainer>
    </BattleEngineMethodEditorContainer>
  );
};
