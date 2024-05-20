import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { TFunction, useTranslation } from 'react-i18next';
import { SelectCustomSimple } from '@components/SelectCustom';
import { SelectItemBall, SelectItemHeld } from '@components/selects';
import { assertUnreachable } from '@utils/assertUnreachable';
import { StudioEncounterShiny, StudioGroupEncounter } from '@modelEntities/groupEncounter';
import { PartialStudioGroupEncounter, RecordExpandPokemonSetup } from './usePokemonBattler';
import { CurrentBattlerType, PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import { EmbeddedUnitInputNumber, InputNumber } from './InputNumber';

export const GenderCategories = [-1, 0, 1, 2] as const;
export const ShinyCategories = ['default', 'always', 'never', 'custom'] as const;
export type ShinyCategory = (typeof ShinyCategories)[number];

const determineShinyCategory = (shinySetup: StudioGroupEncounter['shinySetup']) => {
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

const shinyCategoryEntries = (t: TFunction<('database_items' | 'pokemon_battler_list')[]>) =>
  ShinyCategories.map((category) => ({ value: category.toString(), label: t(`pokemon_battler_list:shiny_${category}`) }));

const genderCategoryEntries = (t: TFunction<('database_items' | 'pokemon_battler_list')[]>) =>
  GenderCategories.map((category) => ({ value: category.toString(), label: t(`pokemon_battler_list:gender${category}`) }));

type PokemonBattlerModeInfoEditorProps = {
  encounter: PartialStudioGroupEncounter;
  updateEncounter: (updates: Partial<PartialStudioGroupEncounter>) => void;
  expandPokemonSetup: RecordExpandPokemonSetup;
  updateExpandPokemonSetup: (updates: Partial<RecordExpandPokemonSetup>) => void;
  from: PokemonBattlerFrom;
  action: 'edit' | 'creation';
  currentBattler: CurrentBattlerType;
  isChangeOrder: boolean;
  setIsChangeOrder: Dispatch<SetStateAction<boolean>>;
  collapseByDefault: boolean;
};

export const PokemonBattlerMoreInfoEditor = ({
  encounter,
  updateEncounter,
  expandPokemonSetup,
  updateExpandPokemonSetup,
  from,
  action,
  currentBattler,
  isChangeOrder,
  setIsChangeOrder,
  collapseByDefault,
}: PokemonBattlerModeInfoEditorProps) => {
  const { t } = useTranslation(['database_items', 'pokemon_battler_list']);
  /* eslint-disable react-hooks/exhaustive-deps */
  const shinyOptions = useMemo(() => shinyCategoryEntries(t), []);
  const genderOptions = useMemo(() => genderCategoryEntries(t), []);
  const [shinyCategory, setShinyCategory] = useState(determineShinyCategory(encounter.shinySetup));
  const shinyRef = useRef<HTMLInputElement>(null);
  const loyaltyRef = useRef<HTMLInputElement>(null);
  const rarenessRef = useRef<HTMLInputElement>(null);

  const onChangeShiny = (shinyCategory: ShinyCategory): StudioEncounterShiny => {
    setShinyCategory(shinyCategory);
    switch (shinyCategory) {
      case 'always':
        return { kind: 'rate', rate: 1 };
      case 'default':
        return { kind: 'automatic', rate: -1 };
      case 'never':
      case 'custom':
        return { kind: 'rate', rate: 0 };
      default:
        assertUnreachable(shinyCategory);
    }
    return { kind: 'automatic', rate: -1 };
  };

  useEffect(() => {
    if (!rarenessRef.current) return;
    rarenessRef.current.value = expandPokemonSetup.rareness.toString();
  }, [encounter.specie]);

  return (
    <InputGroupCollapse title={t(`pokemon_battler_list:more_info_title`)} gap="24px" collapseByDefault={collapseByDefault || undefined}>
      {from !== 'group' && action === 'edit' && currentBattler.index !== 0 && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="change-order">{t('pokemon_battler_list:pokemon_first_position')}</Label>
          <Toggle name="change-order" checked={isChangeOrder} onChange={(event) => setIsChangeOrder(event.target.checked)} />
        </InputWithLeftLabelContainer>
      )}
      {from !== 'group' && (
        <InputWithTopLabelContainer>
          <Label htmlFor="given-name">{t('pokemon_battler_list:given_name')}</Label>
          <Input
            type="text"
            name="given-name"
            value={expandPokemonSetup.givenName as string}
            onChange={(event) => updateExpandPokemonSetup({ givenName: event.target.value })}
          />
        </InputWithTopLabelContainer>
      )}
      <InputWithTopLabelContainer>
        <Label htmlFor="select-shiny">{t('pokemon_battler_list:shiny')}</Label>
        <SelectCustomSimple
          id="select-shiny"
          options={shinyOptions}
          value={shinyCategory}
          onChange={(selected) => updateEncounter({ shinySetup: onChangeShiny(selected as ShinyCategory) })}
          noTooltip
        />
      </InputWithTopLabelContainer>
      {shinyCategory === 'custom' && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="shiny-custom">{t('pokemon_battler_list:shiny_custom')}</Label>
          <EmbeddedUnitInputNumber
            name="shiny-custom"
            min="0"
            max="100"
            unit="%"
            defaultValue={encounter.shinySetup.rate * 100}
            onChange={(value) => updateEncounter({ shinySetup: { ...encounter.shinySetup, rate: value / 100 } })}
            ref={shinyRef}
          />
        </InputWithLeftLabelContainer>
      )}
      <InputWithTopLabelContainer>
        <Label htmlFor="select-gender">{t('pokemon_battler_list:gender')}</Label>
        <SelectCustomSimple
          id="select-gender"
          options={genderOptions}
          value={expandPokemonSetup.gender.toString()}
          onChange={(selected) => updateExpandPokemonSetup({ gender: Number(selected) })}
          noTooltip
        />
      </InputWithTopLabelContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-item-held">{t('pokemon_battler_list:item_held')}</Label>
        <SelectItemHeld
          dbSymbol={expandPokemonSetup.itemHeld as string}
          onChange={(itemHeld) => updateExpandPokemonSetup({ itemHeld })}
          undefValueOption={t('pokemon_battler_list:none_item')}
          noLabel
        />
      </InputWithTopLabelContainer>
      {from !== 'group' && (
        <InputWithTopLabelContainer>
          <Label htmlFor="select-caught-with">{t('pokemon_battler_list:caught_with')}</Label>
          <SelectItemBall
            dbSymbol={expandPokemonSetup.caughtWith as string}
            onChange={(caughtWith) => updateExpandPokemonSetup({ caughtWith })}
            noLabel
          />
        </InputWithTopLabelContainer>
      )}
      <InputWithLeftLabelContainer>
        <Label htmlFor="loyalty">{t('pokemon_battler_list:loyalty')}</Label>
        <InputNumber
          name="loyalty"
          min="0"
          max="255"
          defaultValue={expandPokemonSetup.loyalty as number}
          onChange={(loyalty) => updateExpandPokemonSetup({ loyalty })}
          ref={loyaltyRef}
        />
      </InputWithLeftLabelContainer>
      {from === 'group' && (
        <InputWithLeftLabelContainer>
          <Label htmlFor="rareness">{t('pokemon_battler_list:rareness')}</Label>
          <InputNumber
            name="rareness"
            min="0"
            max="255"
            defaultValue={expandPokemonSetup.rareness as number}
            onChange={(rareness) => updateExpandPokemonSetup({ rareness })}
            ref={rarenessRef}
          />
        </InputWithLeftLabelContainer>
      )}
    </InputGroupCollapse>
  );
};
