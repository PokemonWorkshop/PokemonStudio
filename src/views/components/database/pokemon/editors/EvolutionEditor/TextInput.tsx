import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { EvolutionConditionEditorInput } from './InputProps';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const EvolutionInfo = styled.p`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
  margin: 0;
`;

const validInputs = ['maps', 'func'] as const;
type StringType = (typeof validInputs)[number];
const isTypeValidInput = (type: unknown): type is StringType => validInputs.includes(type as StringType);

type TextInputProps = EvolutionConditionEditorInput & {
  evolutionInfo?: string;
};

export const TextInput = ({ type, state, inputRefs, evolutionInfo }: TextInputProps) => {
  const { t } = useTranslation('database_pokemon');

  useEffect(() => {
    if (!isTypeValidInput(type)) return;

    const ref = inputRefs.current[type];
    if (!ref) return;

    ref.value = state.defaults[type]?.toString() || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (!isTypeValidInput(type)) return null;

  return (
    <InputWithTopLabelContainer>
      <Label>{t(`evolutionValue_${type}`)}</Label>
      <Input type="text" defaultValue={state.defaults[type]?.toString()} ref={(ref) => (inputRefs.current[type] = ref)} />
      {evolutionInfo && <EvolutionInfo>{evolutionInfo}</EvolutionInfo>}
    </InputWithTopLabelContainer>
  );
};
