import { useRefreshUI } from '@components/editor';
import { Editor } from '@components/editor/Editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectDataGeneric } from '@components/selects';

import PokemonModel from '@modelEntities/pokemon/Pokemon.model';
import PokemonForm, { ItemHeld } from '@modelEntities/pokemon/PokemonForm';
import { ProjectData } from '@src/GlobalStateProvider';
import { useProjectItems } from '@utils/useProjectData';

import React, { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ItemHeldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type ItemHeldComponentProps = {
  title: string;
  name: string;
  itemHeld: ItemHeld;
  items: ProjectData['items'];
  itemHeldOptions: SelectOption[];
  refreshUI: (_: unknown) => void;
  t: TFunction<('database_pokemon' | 'database_items')[]>;
};

const ItemHeldComponent = ({ title, name, itemHeld, items, itemHeldOptions, refreshUI, t }: ItemHeldComponentProps) => {
  const onChangeItem = (dbSymbol: string) => {
    itemHeld.dbSymbol = dbSymbol;
    if (dbSymbol === '__undef__') itemHeld.chance = 0;
  };

  return (
    <ItemHeldContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor={name}>{title}</Label>
        <SelectDataGeneric
          data={{ value: itemHeld.dbSymbol, label: items[itemHeld.dbSymbol]?.name() || t('database_items:item_deleted') }}
          options={itemHeldOptions}
          onChange={(option) => refreshUI(onChangeItem(option.value))}
          noOptionsText={t('database_items:no_option')}
          error={!items[itemHeld.dbSymbol] && itemHeld.dbSymbol !== '__undef__'}
          noneValue
        />
      </InputWithTopLabelContainer>
      {itemHeld.dbSymbol !== '__undef__' && (
        <InputWithLeftLabelContainer>
          <Label htmlFor={`chance-${name}`}>{t('database_pokemon:chance')}</Label>
          <EmbeddedUnitInput
            unit="%"
            name={`chance-${name}`}
            type="number"
            min="0"
            max="100"
            step="1"
            value={isNaN(itemHeld.chance) ? '' : itemHeld.chance}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              if (value < 0 || value > 100) return event.preventDefault();
              refreshUI((itemHeld.chance = value));
            }}
            onBlur={() => refreshUI((itemHeld.chance = isNaN(itemHeld.chance) ? 0 : itemHeld.chance))}
          />
        </InputWithLeftLabelContainer>
      )}
    </ItemHeldContainer>
  );
};

type EncounterEditorProps = {
  currentPokemon: PokemonModel;
  currentFormIndex: number;
};

const getItemHeldOptions = (allItems: ProjectData['items']): SelectOption[] =>
  Object.entries(allItems)
    .filter(([, itemData]) => itemData.isHoldable)
    .map(([value, itemData]) => ({ value, label: itemData.name(), index: itemData.id }))
    .sort((a, b) => a.index - b.index);

const defaultValuesItemHeld = (form: PokemonForm) => {
  if (form.itemHeld.length === 0) form.itemHeld = PokemonForm.defaultValuesItemHeld();
};

export const EncounterEditor = ({ currentPokemon, currentFormIndex }: EncounterEditorProps) => {
  const { t } = useTranslation(['database_pokemon', 'database_items']);
  const refreshUI = useRefreshUI();
  const form = currentPokemon.forms[currentFormIndex];
  const { projectDataValues: items } = useProjectItems();
  const itemHeldOptions = useMemo(() => getItemHeldOptions(items), [items]);
  useMemo(() => defaultValuesItemHeld(form), [form]);
  useMemo(() => form.changeDefaultValueItemHeld('__undef__'), [form]);

  return (
    <Editor type="edit" title={t('database_pokemon:encounter')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="catch_rate">{t('database_pokemon:catch_rate')}</Label>
          <Input
            name="catch_rate"
            type="number"
            value={isNaN(form.catchRate) ? '' : form.catchRate}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              if (value < 0 || value > 255) return event.preventDefault();
              refreshUI((form.catchRate = value));
            }}
            onBlur={() => refreshUI((form.catchRate = isNaN(form.catchRate) ? 0 : form.catchRate))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="genderless">{t('database_pokemon:genderless')}</Label>
          <Toggle
            checked={form.femaleRate === -1}
            name="genderless"
            onChange={(event) => {
              refreshUI((form.femaleRate = event.target.checked ? -1 : 0));
            }}
          />
        </InputWithLeftLabelContainer>
        {form.femaleRate !== -1 && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="female_rate">{t('database_pokemon:female_rate')}</Label>
            <EmbeddedUnitInput
              unit="%"
              name="female_rate"
              type="number"
              step="0.1"
              value={form.femaleRate}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (value < 0 || value > 100) return event.preventDefault();
                refreshUI((form.femaleRate = value));
              }}
              onBlur={() => (form.femaleRate = isNaN(form.femaleRate) ? 0 : form.femaleRate)}
            />
          </InputWithLeftLabelContainer>
        )}
        <ItemHeldComponent
          title={t('database_pokemon:common_item_held')}
          name="common-item"
          itemHeld={form.itemHeld[0]}
          items={items}
          itemHeldOptions={itemHeldOptions}
          refreshUI={refreshUI}
          t={t}
        />
        <ItemHeldComponent
          title={t('database_pokemon:rare_item_held')}
          name="rare-item"
          itemHeld={form.itemHeld[1]}
          items={items}
          itemHeldOptions={itemHeldOptions}
          refreshUI={refreshUI}
          t={t}
        />
      </InputContainer>
    </Editor>
  );
};
