import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { UseProjectItemReturnType } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import { HealingItemCategories, mutateItemToProgressionCategory } from './mutateItemToHealingCategory';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItem, StudioItemStatusCondition } from '@modelEntities/item';

type ItemHealDataEditorProps = {
  item: StudioItem;
  setItems: UseProjectItemReturnType['setProjectDataValues'];
};

export const getHealedStatus = (statusList: StudioItemStatusCondition[]) => {
  if (statusList.length === 0) return 'NONE';
  if (statusList.length === 1) return statusList[0];

  return 'ALL';
};

const Statuses = ['POISONED', 'PARALYZED', 'BURN', 'ASLEEP', 'FROZEN', 'TOXIC', 'CONFUSED', 'DEATH', 'ALL'] as const;
const PPIncreaseOptions = [
  { value: '+20%', label: '+20%' },
  { value: 'Max', label: 'Max' },
];

export const ItemHealDataEditor = ({ item, setItems }: ItemHealDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const healingOptions = useMemo(
    () => HealingItemCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statusesOptions = useMemo(() => Statuses.map((status) => ({ value: status, label: t(status) })), [t]);
  const healedStatus = 'statusList' in item ? getHealedStatus(item.statusList) : undefined;

  return LOCKED_ITEM_EDITOR[item.klass].includes('heal') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('heal')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="category">{t('category')}</Label>
          <SelectCustomSimple
            id="select-category"
            options={healingOptions}
            value={item.klass}
            onChange={(value) => {
              setItems({ [item.dbSymbol]: mutateItemToProgressionCategory(item, value as typeof healingOptions[number]['value']) });
            }}
          />
        </InputWithTopLabelContainer>
        {'hpCount' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_hp')}</Label>
            <Input
              type="number"
              name="value"
              min="0"
              max="9999"
              value={isNaN(item.hpCount) ? '' : item.hpCount}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 9999) return event.preventDefault();
                refreshUI((item.hpCount = newValue));
              }}
              onBlur={() => refreshUI((item.hpCount = cleanNaNValue(item.hpCount)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {'hpRate' in item && (
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
                refreshUI((item.hpRate = newValue / 100));
              }}
              onBlur={() => refreshUI((item.hpRate = cleanNaNValue(item.hpRate)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {'ppCount' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_pp')}</Label>
            <Input
              type="number"
              name="value"
              value={isNaN(item.ppCount) ? '' : item.ppCount}
              min="0"
              max="99"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                refreshUI((item.ppCount = newValue));
              }}
              onBlur={() => refreshUI((item.ppCount = cleanNaNValue(item.ppCount)))}
            />
          </InputWithLeftLabelContainer>
        )}
        {'isMax' in item && (
          <InputWithTopLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <SelectCustomSimple
              id="select-value"
              options={PPIncreaseOptions}
              value={item.isMax ? 'Max' : '+20%'}
              onChange={(value) => refreshUI((item.isMax = value === 'Max'))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {'statusList' in item && (
          <InputWithTopLabelContainer>
            <Label htmlFor="status">{t('healed_status')}</Label>
            <SelectCustomSimple
              id="select-status"
              options={statusesOptions}
              value={healedStatus || '???'}
              onChange={(value) =>
                refreshUI(
                  (item.statusList = (value === 'ALL' ? Statuses.slice(0, -3) : [value]) as [
                    StudioItemStatusCondition,
                    ...StudioItemStatusCondition[]
                  ])
                )
              }
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {'loyaltyMalus' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="hapiness_malus">{t('hapiness_malus')}</Label>
            <Input
              type="number"
              name="hapiness_malus"
              value={isNaN(item.loyaltyMalus) ? '' : item.loyaltyMalus}
              min="-255"
              max="255"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < -255 || newValue > 255) return event.preventDefault();
                refreshUI((item.loyaltyMalus = newValue));
              }}
              onBlur={() => refreshUI((item.loyaltyMalus = cleanNaNValue(item.loyaltyMalus)))}
            />
          </InputWithLeftLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
