import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import ItemModel from '@modelEntities/item/Item.model';
import { UseProjectItemReturnType } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import HealingItemModel from '@modelEntities/item/HealingItem.model';
import ConstantHealItemModel from '@modelEntities/item/ConstantHealItem.model';
import PPHealItemModel from '@modelEntities/item/PPHealItem.model';
import RateHealItemModel from '@modelEntities/item/RateHealItem.model';
import PPIncreaseItemModel from '@modelEntities/item/PPIncreaseItem.model';
import StatusHealItemModel, { getHealedStatus } from '@modelEntities/item/StatusHealItem.model';
import StatusRateHealItemModel from '@modelEntities/item/StatusRateHealItem.model';
import { HealingItemCategories, mutateItemToProgressionCategory } from './mutateItemToHealingCategory';
import StatusConstantHealItemModel from '@modelEntities/item/StatusConstantHealItem.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type ItemHealDataEditorProps = {
  item: ItemModel;
  setItems: UseProjectItemReturnType['setProjectDataValues'];
};

const Statuses = ['POISONED', 'PARALYZED', 'BURN', 'ASLEEP', 'FROZEN', 'TOXIC', 'CONFUSED', 'DEATH', 'ALL'] as const;
const PPIncreaseOptions = [
  { value: '+20%', label: '+20%' },
  { value: 'Max', label: 'Max' },
];

export const ItemHealDataEditor = ({ item, setItems }: ItemHealDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const healItem = item instanceof HealingItemModel ? item : undefined;
  const healingOptions = useMemo(
    () => HealingItemCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statusesOptions = useMemo(() => Statuses.map((status) => ({ value: status, label: t(status) })), [t]);
  const healedStatus =
    healItem instanceof StatusHealItemModel || healItem instanceof StatusRateHealItemModel || healItem instanceof StatusConstantHealItemModel
      ? getHealedStatus(healItem.statusList)
      : undefined;

  return item.lockedEditors.includes('heal') || !healItem ? (
    <></>
  ) : (
    <Editor type="edit" title={t('heal')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={healingOptions}
            value={healItem.klass}
            onChange={(value) => {
              setItems({ [item.dbSymbol]: mutateItemToProgressionCategory(item, value as typeof healingOptions[number]['value']) });
            }}
          />
        </InputWithTopLabelContainer>
        {item instanceof ConstantHealItemModel && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_hp')}</Label>
            <Input
              type="number"
              name="value"
              min="0"
              max="9999"
              value={healItem.getHealValue() === 'NaN' ? '' : healItem.getHealValue()}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 9999) return event.preventDefault();
                refreshUI(healItem.setHealValue(newValue));
              }}
              onBlur={() => refreshUI(healItem.setHealValue(healItem.getHealValue() === 'NaN' ? 0 : Number(healItem.getHealValue())))}
            />
          </InputWithLeftLabelContainer>
        )}
        {item instanceof RateHealItemModel && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_hp')}</Label>
            <PercentInput
              type="number"
              name="value"
              min="0"
              max="100"
              value={isNaN(item.hpRate) ? '' : (item.hpRate * 100).toFixed(0)}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 100) return event.preventDefault();
                refreshUI(healItem.setHealValue(newValue));
              }}
              onBlur={() => refreshUI((item.hpRate = cleanNaNValue(item.hpRate)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {item instanceof PPHealItemModel && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_pp')}</Label>
            <Input
              type="number"
              name="value"
              value={healItem.getHealValue() === 'NaN' ? '' : healItem.getHealValue()}
              min="0"
              max="99"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                refreshUI(healItem.setHealValue(newValue));
              }}
              onBlur={() => refreshUI(healItem.setHealValue(healItem.getHealValue() === 'NaN' ? 0 : Number(healItem.getHealValue())))}
            />
          </InputWithLeftLabelContainer>
        )}
        {item instanceof PPIncreaseItemModel && (
          <InputWithTopLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <SelectCustomSimple
              id="select-value"
              options={PPIncreaseOptions}
              value={item.getHealValue()}
              onChange={(value) => refreshUI(item.setHealValue(value === 'Max' ? 1 : 0))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {(healItem instanceof StatusHealItemModel ||
          healItem instanceof StatusRateHealItemModel ||
          healItem instanceof StatusConstantHealItemModel) && (
          <InputWithTopLabelContainer>
            <Label htmlFor="status">{t('healed_status')}</Label>
            <SelectCustomSimple
              id="select-status"
              options={statusesOptions}
              value={healedStatus || '???'}
              onChange={(value) => refreshUI((healItem.statusList = value === 'ALL' ? Statuses.slice(0, -3) : [value]))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="hapiness_malus">{t('hapiness_malus')}</Label>
          <Input
            type="number"
            name="hapiness_malus"
            value={isNaN(healItem.loyaltyMalus) ? '' : healItem.loyaltyMalus}
            min="-255"
            max="255"
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < -255 || newValue > 255) return event.preventDefault();
              refreshUI((healItem.loyaltyMalus = newValue));
            }}
            onBlur={() => refreshUI((healItem.loyaltyMalus = cleanNaNValue(healItem.loyaltyMalus)))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
