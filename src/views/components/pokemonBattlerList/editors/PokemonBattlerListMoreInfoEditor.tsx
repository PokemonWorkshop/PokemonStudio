import React, { useMemo, useState } from 'react';
import { useRefreshUI } from '@components/editor';
import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectCustomSimple } from '@components/SelectCustom';
import { SelectDataGeneric } from '@components/selects';
import { ProjectData } from '@src/GlobalStateProvider';
import { useProjectItems, useProjectPokemon } from '@utils/useProjectData';
import { assertUnreachable } from '@utils/assertUnreachable';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { EmbeddedUnitInput } from '@components/inputs/EmbeddedUnitInput';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioGroupEncounter } from '@modelEntities/groupEncounter';

const determineGivenName = (
  battler: StudioGroupEncounter,
  species: ProjectData['pokemon'],
  getEntityName: ReturnType<typeof useGetEntityNameText>
) => {
  const givenName = battler.expandPokemonSetup.find((eps) => eps.type === 'givenName')?.value as string;
  if (givenName === '') return species[battler.specie] ? getEntityName(species[battler.specie]) : '???';
  return givenName;
};

export const GenderCategories = [-1, 0, 1, 2] as const;
export const ShinyCategories = ['default', 'always', 'never', 'custom'] as const;
export type ShinyCategory = typeof ShinyCategories[number];

const determineShinyValue = (shinySetup: StudioGroupEncounter['shinySetup']) => {
  switch (shinySetup.kind) {
    case 'automatic':
      return 'default';
    case 'rate':
      if (shinySetup.rate === 0) return 'never';
      if (shinySetup.rate === 1) return 'always';
      return 'custom';
    default:
      assertUnreachable(shinySetup.kind);
  }
  return 'default';
};

const determineRareness = (battler: StudioGroupEncounter, species: ProjectData['pokemon']) => {
  const rareness = battler.expandPokemonSetup.find((eps) => eps.type === 'rareness')?.value as number;
  if (rareness === -1) return species[battler.specie]?.forms.find((form) => form.form === battler.form)?.catchRate || 0;
  return rareness;
};

const shinyCategoryEntries = (t: TFunction<('database_items' | 'pokemon_battler_list')[]>) =>
  ShinyCategories.map((category) => ({ value: category.toString(), label: t(`pokemon_battler_list:shiny_${category}`) }));

const genderCategoryEntries = (t: TFunction<('database_items' | 'pokemon_battler_list')[]>) =>
  GenderCategories.map((category) => ({ value: category.toString(), label: t(`pokemon_battler_list:gender${category}`) }));

const getItemHeldOptions = (allItems: ProjectData['items'], getEntityName: ReturnType<typeof useGetEntityNameText>) =>
  Object.values(allItems)
    .filter((itemData) => itemData.isHoldable)
    .sort((a, b) => a.id - b.id)
    .map((itemData) => ({ value: itemData.dbSymbol, label: getEntityName(itemData) }));

const getBallOptions = (allItems: ProjectData['items'], getEntityName: ReturnType<typeof useGetEntityNameText>) =>
  Object.values(allItems)
    .filter((itemData) => itemData.klass === 'BallItem')
    .sort((a, b) => a.id - b.id)
    .map((itemData) => ({ value: itemData.dbSymbol, label: getEntityName(itemData) }));

type PokemonBattlerListModeInfoEditorProps = {
  battler: StudioGroupEncounter;
  collapseByDefault: boolean;
  isWild: boolean;
  index: number | undefined;
  onChangeOrder: () => void;
};

export const PokemonBattlerListMoreInfoEditor = ({
  battler,
  collapseByDefault,
  isWild,
  index,
  onChangeOrder,
}: PokemonBattlerListModeInfoEditorProps) => {
  const { projectDataValues: items } = useProjectItems();
  const { projectDataValues: species } = useProjectPokemon();
  const getEntityName = useGetEntityNameText();
  const { t } = useTranslation(['database_items', 'pokemon_battler_list']);
  /* eslint-disable react-hooks/exhaustive-deps */
  const shinyOptions = useMemo(() => shinyCategoryEntries(t), []);
  const genderOptions = useMemo(() => genderCategoryEntries(t), []);
  const itemHeldOptions = useMemo(() => getItemHeldOptions(items, getEntityName), [items]);
  const ballOptions = useMemo(() => getBallOptions(items, getEntityName), [items]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const [givenName, setGivenName] = useState(determineGivenName(battler, species, getEntityName));
  const [shiny, setShiny] = useState(determineShinyValue(battler.shinySetup));
  const [gender, setGender] = useState(battler.expandPokemonSetup.find((eps) => eps.type === 'gender')?.value as number);
  const [itemHeld, setItemHeld] = useState(battler.expandPokemonSetup.find((eps) => eps.type === 'itemHeld')?.value as string);
  const [caughtWith, setCaughtWith] = useState(battler.expandPokemonSetup.find((eps) => eps.type === 'caughtWith')?.value as string);
  const [loyalty, setLoyalty] = useState(battler.expandPokemonSetup.find((eps) => eps.type === 'loyalty')?.value as number);
  const [rareness, setRareness] = useState(determineRareness(battler, species));
  const [currentIndex, setCurrentIndex] = useState(index);
  const refreshUI = useRefreshUI();

  const onChangeFirstPokemon = () => {
    setCurrentIndex(0);
    onChangeOrder();
  };

  const onChangeGivenName = (value: string) => {
    const givenNameSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'givenName');
    if (givenNameSetup) {
      givenNameSetup.value = value;
      setGivenName(value);
    }
  };

  const onChangeShiny = (shinyCategory: ShinyCategory) => {
    setShiny(shinyCategory);
    switch (shinyCategory) {
      case 'always':
        battler.shinySetup = { kind: 'rate', rate: 1 };
        break;
      case 'default':
        battler.shinySetup = { kind: 'automatic', rate: -1 };
        break;
      case 'never':
      case 'custom':
        battler.shinySetup = { kind: 'rate', rate: 0 };
        break;
      default:
        assertUnreachable(shinyCategory);
    }
  };

  const onChangeGender = (value: string) => {
    const genderSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'gender');
    if (genderSetup) {
      genderSetup.value = Number(value);
      setGender(Number(value));
    }
  };

  const onChangeItemHeld = (value: string) => {
    const itemHeldSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'itemHeld');
    if (itemHeldSetup) {
      itemHeldSetup.value = value === '__undef__' ? 'none' : value;
      setItemHeld(value);
    }
  };

  const onChangeCaughtWith = (value: string) => {
    const caughtWithSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'caughtWith');
    if (caughtWithSetup) {
      caughtWithSetup.value = value;
      setCaughtWith(value);
    }
  };

  const onChangeLoyalty = (value: number) => {
    const loyaltySetup = battler.expandPokemonSetup.find((eps) => eps.type === 'loyalty');
    if (loyaltySetup) {
      loyaltySetup.value = value;
      setLoyalty(value);
    }
  };

  const onChangeRareness = (value: number) => {
    const rarenessSetup = battler.expandPokemonSetup.find((eps) => eps.type === 'rareness');
    if (rarenessSetup) {
      rarenessSetup.value = value;
      setRareness(value);
    }
  };

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:more_info_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      <PaddedInputContainer size="m">
        {!isWild && currentIndex !== undefined && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="change-order">{t('pokemon_battler_list:pokemon_first_position')}</Label>
            <Toggle name="change-order" checked={currentIndex === 0} onChange={() => refreshUI(onChangeFirstPokemon())} />
          </InputWithLeftLabelContainer>
        )}
        {!isWild && battler.specie !== '__undef__' && species[battler.specie] && (
          <InputWithTopLabelContainer>
            <Label htmlFor="given-name">{t('pokemon_battler_list:given_name')}</Label>
            <Input type="text" name="given-name" value={givenName} onChange={(event) => refreshUI(onChangeGivenName(event.target.value))} />
          </InputWithTopLabelContainer>
        )}
        <InputWithTopLabelContainer>
          <Label htmlFor="select-shiny">{t('pokemon_battler_list:shiny')}</Label>
          <SelectCustomSimple
            id="select-shiny"
            options={shinyOptions}
            value={shiny}
            onChange={(selected) => refreshUI(onChangeShiny(selected as ShinyCategory))}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {shiny === 'custom' && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="shiny-custom">{t('pokemon_battler_list:shiny_custom')}</Label>
            <EmbeddedUnitInput
              type="number"
              name="shiny-custom"
              min="0"
              max="100"
              unit="%"
              value={isNaN(battler.shinySetup.rate) ? '' : battler.shinySetup.rate * 100}
              onChange={(event) => {
                const newValue = parseInt(event.target.value) / 100;
                if (newValue < 0 || newValue > 1) return event.preventDefault();
                refreshUI((battler.shinySetup.rate = newValue));
              }}
              onBlur={() => refreshUI((battler.shinySetup.rate = cleanNaNValue(battler.shinySetup.rate)))}
            />
          </InputWithLeftLabelContainer>
        )}
        <InputWithTopLabelContainer>
          <Label htmlFor="select-gender">{t('pokemon_battler_list:gender')}</Label>
          <SelectCustomSimple
            id="select-gender"
            options={genderOptions}
            value={gender.toString()}
            onChange={(selected) => refreshUI(onChangeGender(selected))}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {!isWild && (
          <InputWithTopLabelContainer>
            <Label htmlFor="select-item-held">{t('pokemon_battler_list:item_held')}</Label>
            <SelectDataGeneric
              data={{
                value: itemHeld === 'none' ? '__undef__' : itemHeld,
                label: items[itemHeld] ? getEntityName(items[itemHeld]) : t('database_items:item_deleted'),
              }}
              options={itemHeldOptions}
              onChange={(selected) => refreshUI(onChangeItemHeld(selected.value))}
              noOptionsText={t('database_items:no_option')}
              error={!items[itemHeld] && itemHeld !== '__undef__' && itemHeld !== 'none'}
              noneValue
              overwriteNoneValue={t('pokemon_battler_list:none_item')}
            />
          </InputWithTopLabelContainer>
        )}
        {!isWild && (
          <InputWithTopLabelContainer>
            <Label htmlFor="select-caught-with">{t('pokemon_battler_list:caught_with')}</Label>
            <SelectDataGeneric
              data={{
                value: caughtWith,
                label: items[caughtWith] ? getEntityName(items[caughtWith]) : t('database_items:item_deleted'),
              }}
              options={ballOptions}
              onChange={(selected) => refreshUI(onChangeCaughtWith(selected.value))}
              noOptionsText={t('database_items:no_option')}
              error={!items[caughtWith]}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="loyalty">{t('pokemon_battler_list:loyalty')}</Label>
          <Input
            type="number"
            name="loyalty"
            min="0"
            max="255"
            value={isNaN(loyalty) ? '' : loyalty}
            onChange={(event) => {
              const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
              if (newValue < 0 || newValue > 255) return event.preventDefault();
              refreshUI(onChangeLoyalty(newValue));
            }}
            onBlur={() => onChangeLoyalty(cleanNaNValue(loyalty, 0))}
          />
        </InputWithLeftLabelContainer>
        {isWild && battler.specie !== '__undef__' && species[battler.specie] && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="rareness">{t('pokemon_battler_list:rareness')}</Label>
            <Input
              type="number"
              name="rareness"
              min="0"
              max="255"
              value={isNaN(rareness) ? '' : rareness}
              onChange={(event) => {
                const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
                if (newValue < 0 || newValue > 255) return event.preventDefault();
                refreshUI(onChangeRareness(newValue));
              }}
              onBlur={() => onChangeRareness(cleanNaNValue(rareness, 0))}
            />
          </InputWithLeftLabelContainer>
        )}
      </PaddedInputContainer>
    </InputGroupCollapse>
  );
};
