import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import GroupModel, { GroupActivationsMap, GroupBattleTypes, GroupVariationsMap, SystemTag, SystemTags } from '@modelEntities/group/Group.model';
import { SelectCustomSimple } from '@components/SelectCustom';
import {
  getActivationValue,
  getSwitchValue,
  getVariationValue,
  needSwitchInput,
  onActivationChange,
  onSwitchInputChange,
  onVariationChange,
} from '@utils/GroupUtils';
import { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';

const groupActivationEntries = (t: TFunction<'database_groups'>) =>
  GroupActivationsMap.map((option) => ({ value: option.value, label: t(option.label as never) }));
const groupBattleTypeEntries = (t: TFunction<'database_groups'>) => GroupBattleTypes.map((type) => ({ value: type, label: t(type) }));
const systemTagsEntries = (t: TFunction<'database_groups'>) => SystemTags.map((tag) => ({ value: tag, label: t(tag) }));
const groupVariationEntries = (t: TFunction<'database_groups'>) =>
  GroupVariationsMap.map((variation) => ({ value: variation.value, label: t(variation.label as never) }));

type GroupFrameEditorProps = {
  group: GroupModel;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const GroupFrameEditor = ({ group, openTranslationEditor }: GroupFrameEditorProps) => {
  const { t } = useTranslation('database_groups');
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
              value={group.name()}
              onChange={(event) => refreshUI(group.setName(event.target.value))}
              placeholder={t('example_name')}
            />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-activation">{t('activation')}</Label>
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
                value={getSwitchValue(group)}
                onChange={(event) => onSwitchInputChange(event.target.value, group, refreshUI)}
              />
            </InputWithLeftLabelContainer>
          )}
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
            onChange={(value) => refreshUI((group.systemTag = value as SystemTag))}
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
