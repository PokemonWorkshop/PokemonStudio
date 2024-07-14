import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ENCOUNTER_EDITOR_SCHEMA } from './EncounterEditorSchema';

const ItemHeldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type ItemHeldEditorProps = {
  index: number;
  options: SelectOption[];
  getRawFormData: () => Record<string, unknown>;
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
  formRef: React.RefObject<HTMLFormElement>;
};

export const ItemHeldEditor = ({ index, options, getRawFormData, onTouched, defaults, formRef }: ItemHeldEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const divRef = useRef<HTMLDivElement>(null);
  const { Select, EmbeddedUnitInput } = useInputAttrsWithLabel(ENCOUNTER_EDITOR_SCHEMA, defaults);

  const itemInputName = `itemHeld.${index}.dbSymbol`;
  const itemDbSymbol = getRawFormData()[itemInputName] ?? defaults[itemInputName];
  const label = t(index === 0 ? 'common_item_held' : 'rare_item_held');
  const onChange = (value: string) => {
    if (divRef.current) divRef.current.style.display = value === 'none' ? 'none' : 'block';

    const chanceElement = formRef.current?.elements.namedItem(`itemHeld.${index}.chance`);
    if (!(chanceElement instanceof HTMLInputElement) || value !== 'none') return;

    chanceElement.value = '0';
  };

  return (
    <ItemHeldContainer>
      <Select name={itemInputName} label={label} options={options} onChange={onChange} chooseValue="none" />
      <div style={{ display: itemDbSymbol === 'none' || itemDbSymbol === undefined ? 'none' : undefined }} ref={divRef}>
        <EmbeddedUnitInput name={`itemHeld.${index}.chance`} unit="%" label={t('chance')} labelLeft onInput={onTouched} />
      </div>
    </ItemHeldContainer>
  );
};
