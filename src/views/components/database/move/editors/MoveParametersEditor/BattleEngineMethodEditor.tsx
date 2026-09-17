import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectCustomWithInput } from '@components/SelectCustom/SelectCustomWithInput';
import { StudioMove } from '@modelEntities/move';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const BattleEngineMethodEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CustomProcedureInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
  background-color: ${({ theme }) => theme.colors.warningSoft};
  border-left: 3px solid ${({ theme }) => theme.colors.warningBase};
  border-radius: 4px;
  padding: 8px 12px;
`;

type BattleEngineMethodEditorProps = {
  move: StudioMove;
  options: SelectOption[];
  getRawFormData: () => Record<string, unknown>;
  defaults: Record<string, unknown>;
};

export const BattleEngineMethodEditor = ({ move, options, getRawFormData, defaults }: BattleEngineMethodEditorProps) => {
  const { t } = useTranslation();
  const [defaultInputValue, setDefaultInputValue] = useState(String(defaults.battleEngineMethod));
  const isCustomProcedure = (value: string) => !options.some((option) => option.value === value);
  const battleEngineMethod = String(getRawFormData().battleEngineMethod ?? defaults.battleEngineMethod);
  const [hasCustomProcedure, setHasCustomProcedure] = useState(() => isCustomProcedure(battleEngineMethod));

  const onChange = (value: string) => {
    setHasCustomProcedure(isCustomProcedure(value));

    if (value === 'custom') {
      setDefaultInputValue(`s_${move.dbSymbol}`);
    }
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
        {hasCustomProcedure && <CustomProcedureInfo>{t('move_custom_procedure_info')}</CustomProcedureInfo>}
      </InputWithTopLabelContainer>
    </BattleEngineMethodEditorContainer>
  );
};
