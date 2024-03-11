import { Editor } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { StudioDropDown } from '@components/StudioDropDown';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { useCreaturePage } from '@utils/usePage';
import { useSelectOptions } from '@utils/useSelectOptions';

import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useUpdateForm } from './useUpdateForm';

const ItemHeldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type ItemHeldEditorProps = {
  title: string;
  index: number;
  originalChance: number;
  options: SelectOption[];
  rarityRefs: React.MutableRefObject<(HTMLInputElement | null | undefined)[]>;
  itemDbSymbolRefs: React.MutableRefObject<DbSymbol[]>;
};

const ItemHeldEditor = ({ title, index, originalChance, options, rarityRefs, itemDbSymbolRefs }: ItemHeldEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_items']);
  const [itemDbSymbol, setItemDbSymbol] = useState(itemDbSymbolRefs.current[index]);
  const name = `creature-item-held-editor-${index}`;
  const divStyle = { display: itemDbSymbol === '__undef__' ? 'none' : undefined };

  return (
    <ItemHeldContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor={name}>{title}</Label>
        <StudioDropDown
          options={options}
          value={itemDbSymbol}
          onChange={(value) => {
            itemDbSymbolRefs.current[index] = value as DbSymbol;
            setItemDbSymbol(value as DbSymbol);
          }}
        />
      </InputWithTopLabelContainer>
      <InputWithLeftLabelContainer style={divStyle}>
        <Label htmlFor={`chance-${name}`}>{t('database_pokemon:chance')}</Label>
        <EmbeddedUnitInput
          unit="%"
          name={`chance-${name}`}
          type="number"
          min="0"
          max="100"
          step="1"
          defaultValue={originalChance}
          ref={(ref) => {
            rarityRefs.current[index] = ref;
          }}
        />
      </InputWithLeftLabelContainer>
    </ItemHeldContainer>
  );
};

export const EncounterEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation(['database_pokemon', 'database_items', 'select']);
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const itemOptions = useSelectOptions('itemHeld');
  const itemOptionsWithNone = useMemo(() => [{ value: 'none', label: t('select:none') }, ...itemOptions], []);
  const [genderLess, setGenderLess] = useState(form.femaleRate === -1);
  const femaleRateRef = useRef<HTMLInputElement>(null);
  const catchRateRef = useRef<HTMLInputElement>(null);
  // TODO: use the fact those refs are array to allow more than 2 items :)
  const rarityRefs = useRef<(HTMLInputElement | null | undefined)[]>([]);
  const itemDbSymbolRefs = useRef<DbSymbol[]>(Array.from({ length: 2 }, (_, i) => form.itemHeld[i]?.dbSymbol || ('none' as DbSymbol)));
  const divStyle = { display: genderLess ? 'none' : undefined };

  const canClose = () => {
    if (!catchRateRef.current || !catchRateRef.current.validity.valid) return false;
    if (!genderLess && femaleRateRef.current && !femaleRateRef.current.validity.valid) return false;
    if (!rarityRefs.current.every((v, i) => !v || itemDbSymbolRefs.current[i] === 'none' || v.validity.valid)) return false;

    return true;
  };

  const onClose = () => {
    if (!catchRateRef.current || !canClose()) return;

    const catchRate = isNaN(catchRateRef.current.valueAsNumber) ? form.catchRate : catchRateRef.current.valueAsNumber;
    const femaleRate = genderLess ? -1 : femaleRateRef.current?.valueAsNumber || 0;

    updateForm({
      itemHeld: itemDbSymbolRefs.current.map((dbSymbol, i) => ({ dbSymbol, chance: rarityRefs.current[i]?.valueAsNumber || 0 })),
      catchRate: catchRate,
      femaleRate,
      resources: {
        ...form.resources,
        // Not sure about this logic I don't get why original was forcing hasFemale for 100%
        hasFemale: femaleRate <= 0 || femaleRate === 100 ? femaleRate === 100 : form.resources.hasFemale,
      },
    });
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('database_pokemon:encounter')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="catch_rate">{t('database_pokemon:catch_rate')}</Label>
          <Input name="catch_rate" type="number" defaultValue={form.catchRate} min={1} max={255} ref={catchRateRef} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="genderless">{t('database_pokemon:genderless')}</Label>
          <Toggle checked={genderLess} name="genderless" onChange={(event) => setGenderLess(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer style={divStyle}>
          <Label htmlFor="female_rate">{t('database_pokemon:female_rate')}</Label>
          <EmbeddedUnitInput
            unit="%"
            name="female_rate"
            type="number"
            step="0.1"
            min={0}
            max={100}
            defaultValue={form.femaleRate}
            ref={femaleRateRef}
          />
        </InputWithLeftLabelContainer>
        <ItemHeldEditor
          index={0}
          title={t('database_pokemon:common_item_held')}
          options={itemOptionsWithNone}
          originalChance={form.itemHeld[0]?.chance || 0}
          rarityRefs={rarityRefs}
          itemDbSymbolRefs={itemDbSymbolRefs}
        />
        <ItemHeldEditor
          index={1}
          title={t('database_pokemon:rare_item_held')}
          options={itemOptionsWithNone}
          originalChance={form.itemHeld[1]?.chance || 0}
          rarityRefs={rarityRefs}
          itemDbSymbolRefs={itemDbSymbolRefs}
        />
      </InputContainer>
    </Editor>
  );
});
EncounterEditor.displayName = 'EncounterEditor';
