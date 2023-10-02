import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PercentInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { HealingItemCategories, mutateItemToProgressionCategory } from './mutateItemToHealingCategory';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItem, StudioItemStatusCondition } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@utils/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectItems } from '@utils/useProjectData';

type ItemType = {
  hpCount?: number;
  hpRate?: number;
  ppCount?: number;
  isMax?: boolean;
  statusList?: string[];
  loyaltyMalus?: number;
};

export const getHealedStatus: (statusList: StudioItemStatusCondition[]) => StudioItemStatusCondition | 'ALL' | 'NONE' = (statusList) => {
  if (!statusList) return 'NONE';
  if (statusList.length === 0) return 'NONE';
  if (statusList.length === 1) return statusList[0];

  return 'ALL';
};

const Statuses = ['POISONED', 'PARALYZED', 'BURN', 'ASLEEP', 'FROZEN', 'TOXIC', 'CONFUSED', 'DEATH', 'ALL'] as const;
const PPIncreaseOptions = [
  { value: '+20%', label: '+20%' },
  { value: 'Max', label: 'Max' },
];

const getFormHealData: (item: StudioItem) => ItemType = (item) => {
  return {
    hpCount: 'hpCount' in item ? item.hpCount : undefined,
    hpRate: 'hpRate' in item && !isNaN(item.hpRate) ? item.hpRate : undefined,
    ppCount: 'ppCount' in item && !isNaN(item.ppCount) ? item.ppCount : undefined,
    isMax: 'isMax' in item ? item.isMax : undefined,
    statusList: 'statusList' in item ? [getHealedStatus(item.statusList)] : undefined,
    loyaltyMalus: 'loyaltyMalus' in item && !isNaN(item.loyaltyMalus) ? item.loyaltyMalus : undefined,
  };
};

export const ItemHealDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const { setProjectDataValues: setProjectItem } = useProjectItems();

  const { t } = useTranslation('database_items');
  const healingOptions = useMemo(
    () => HealingItemCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statusesOptions = useMemo(() => Statuses.map((status) => ({ value: status, label: t(status) })), [t]);

  const [item, setItem] = useState(cloneEntity(currentItem));
  const [klass, setKlass] = useState<string>(item.klass);

  const [healChanges, setHealChanges] = useState<ItemType>(getFormHealData(item));

  const handleClose = () => {
    const filteredFormData: ItemType = Object.entries(healChanges)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'number') return [key, cleanNaNValue(value, (item as never)[key])];
        return [key, value];
      })
      .reduce((acc, [key, value]) => {
        (acc[key as keyof ItemType] as unknown) = value as ItemType[keyof ItemType];
        return acc;
      }, {} as ItemType);

    const newItem = {
      ...item,
      ...filteredFormData,
    };
    setProjectItem({ [item.dbSymbol]: newItem as StudioItem });
  };

  const canClose = () => {
    if ('hpRate' in healChanges && (healChanges.hpRate === 0 || (!!healChanges.hpRate && (healChanges.hpRate < 0.01 || healChanges.hpRate > 100)))) {
      return false;
    }
    return true;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  useEffect(() => {
    setKlass(item.klass);
    setHealChanges(getFormHealData(item));
  }, [item, klass]);

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
              setItem(mutateItemToProgressionCategory(item, value as (typeof healingOptions)[number]['value']));
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
              value={healChanges.hpCount}
              onChange={(event) => {
                const newValue: number = parseInt(event.target.value);
                if (newValue < 0 || newValue > 9999) return event.preventDefault();
                setHealChanges((prevFormData) => ({ ...prevFormData, hpCount: newValue }));
              }}
            />
          </InputWithLeftLabelContainer>
        )}
        {'hpRate' in item && healChanges.hpRate !== undefined && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_hp')}</Label>
            <PercentInput
              type="number"
              name="value"
              min="1"
              max="100"
              value={(healChanges.hpRate * 100).toFixed(0)}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 100) return event.preventDefault();
                setHealChanges((prevFormData) => ({ ...prevFormData, hpRate: newValue / 100 }));
              }}
            />
          </InputWithLeftLabelContainer>
        )}
        {'ppCount' in item && (
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('healed_pp')}</Label>
            <Input
              type="number"
              name="value"
              value={healChanges.ppCount}
              min="0"
              max="99"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                setHealChanges((prevFormData) => ({ ...prevFormData, ppCount: newValue }));
              }}
            />
          </InputWithLeftLabelContainer>
        )}
        {'isMax' in item && (
          <InputWithTopLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <SelectCustomSimple
              id="select-value"
              options={PPIncreaseOptions}
              value={healChanges.isMax ? 'Max' : '+20%'}
              onChange={(value) => setHealChanges((prevFormData) => ({ ...prevFormData, isMax: value === 'Max' }))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {'statusList' in item && healChanges.statusList && (
          <InputWithTopLabelContainer>
            <Label htmlFor="status">{t('healed_status')}</Label>
            <SelectCustomSimple
              id="select-status"
              options={statusesOptions}
              value={healChanges.statusList[0] || '???'}
              onChange={(value) => {
                const newValue = (item.statusList = (value === 'ALL' ? Statuses.slice(0, -3) : [value]) as [
                  StudioItemStatusCondition,
                  ...StudioItemStatusCondition[]
                ]);
                setHealChanges((prevFormData) => ({ ...prevFormData, statusList: newValue }));
              }}
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
              value={healChanges.loyaltyMalus}
              min="-255"
              max="255"
              onChange={(event) => {
                const newValue: number = parseInt(event.target.value);
                if (newValue < -255 || newValue > 255) return event.preventDefault();
                setHealChanges((prevFormData) => ({ ...prevFormData, loyaltyMalus: newValue }));
              }}
            />
          </InputWithLeftLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
ItemHealDataEditor.displayName = 'ItemHealDataEditor';
