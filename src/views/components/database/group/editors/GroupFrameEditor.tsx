import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import {
  getActivationValue,
  getSwitchValue,
  getVariationValue,
  GroupActivationsMap,
  GroupBattleTypes,
  GroupVariationsMap,
  needSwitchInput,
  onActivationChange,
  onSwitchInputChange,
  onVariationChange,
} from '@utils/GroupUtils';
import { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { GROUP_NAME_TEXT_ID, GROUP_SYSTEM_TAGS, StudioGroup, StudioGroupSystemTag } from '@modelEntities/group';

const groupActivationEntries = (t: TFunction<'database_groups'>) =>
  GroupActivationsMap.map((option) => ({ value: option.value, label: t(option.label as never) }));
const groupBattleTypeEntries = (t: TFunction<'database_groups'>) => GroupBattleTypes.map((type) => ({ value: type, label: t(type) }));
const systemTagsEntries = (t: TFunction<'database_groups'>) => GROUP_SYSTEM_TAGS.map((tag) => ({ value: tag, label: t(tag) }));
const groupVariationEntries = (t: TFunction<'database_groups'>) =>
  GroupVariationsMap.map((variation) => ({ value: variation.value, label: t(variation.label) }));

type GroupFrameEditorProps = {
  group: StudioGroup;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const GroupFrameEditor = ({ group, openTranslationEditor }: GroupFrameEditorProps) => {
  const { t } = useTranslation('database_groups');
  const getGroupName = useGetEntityNameText();
  const setText = useSetProjectText();
  const activationOptions = useMemo(() => groupActivationEntries(t), [t]);
  const battleTypeOptions = useMemo(() => groupBattleTypeEntries(t), [t]);
  const systemTagsOptions = useMemo(() => systemTagsEntries(t), [t]);
  const variationOptions = useMemo(() => groupVariationEntries(t), [t]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('group_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
            <Input
              type="text"
              name="name"
              value={getGroupName(group)}
              onChange={(event) => refreshUI(setText(GROUP_NAME_TEXT_ID, group.id, event.target.value))}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-activation">{t('activation')}</Label>
          <InputContainer size="s">
            <SelectCustomSimple
              id="select-activation"
              options={activationOptions}
              onChange={(value) => onActivationChange(value, group, refreshUI)}
              value={getActivationValue(group)}
              noTooltip
            />
            {needSwitchInput(group) && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="switch">{t('switch')}</Label>
                <Input
                  type="number"
                  name="switch"
                  min="0"
                  max="99999"
                  value={isNaN(getSwitchValue(group)) ? '' : getSwitchValue(group)}
                  onChange={(event) => {
                    const newValue = parseInt(event.target.value);
                    if (newValue < 0 || newValue > 99999) return event.preventDefault();
                    onSwitchInputChange(newValue, group, refreshUI);
                  }}
                  onBlur={() => onSwitchInputChange(cleanNaNValue(getSwitchValue(group)), group, refreshUI)}
                />
              </InputWithLeftLabelContainer>
            )}
          </InputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-battle-type">{t('battle_type')}</Label>
          <SelectCustomSimple
            id="select-battle-type"
            options={battleTypeOptions}
            onChange={(value) => refreshUI((group.isDoubleBattle = value === 'double'))}
            value={group.isDoubleBattle ? 'double' : 'simple'}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-environment">{t('environment')}</Label>
          <SelectCustomSimple
            id="select-environment"
            options={systemTagsOptions}
            onChange={(value) => refreshUI((group.systemTag = value as StudioGroupSystemTag))}
            value={group.systemTag ?? 'RegularGround'}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-variation">{t('variation')}</Label>
          <SelectCustomSimple
            id="select-variation"
            options={variationOptions}
            onChange={(value) => onVariationChange(value, group, refreshUI)}
            value={getVariationValue(group)}
            noTooltip
          />
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
