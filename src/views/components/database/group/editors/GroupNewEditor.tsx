import React, { useMemo, useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { useProjectGroups } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import GroupModel, { GroupActivationsMap, GroupBattleTypes, SystemTags, SystemTag, GroupVariationsMap } from '@modelEntities/group/Group.model';
import {
  getActivationValue,
  getSwitchValue,
  getVariationValue,
  needSwitchInput,
  onActivationChange,
  onSwitchInputChange,
  onVariationChange,
} from '@utils/GroupUtils';

const groupActivationEntries = (t: TFunction<'database_groups'>) =>
  GroupActivationsMap.map((activation) => ({ value: activation.value, label: t(activation.label) }));
const groupBattleTypeEntries = (t: TFunction<'database_groups'>) => GroupBattleTypes.map((type) => ({ value: type, label: t(type) }));
const systemTagsEntries = (t: TFunction<'database_groups'>) => SystemTags.map((tag) => ({ value: tag, label: t(tag) }));
const groupVariationEntries = (t: TFunction<'database_groups'>) =>
  GroupVariationsMap.map((variation) => ({ value: variation.value, label: t(variation.label) }));

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type GroupNewEditorProps = {
  onClose: () => void;
};

export const GroupNewEditor = ({ onClose }: GroupNewEditorProps) => {
  const { projectDataValues: groups, setProjectDataValues: setGroup, bindProjectDataValue: bindGroup } = useProjectGroups();
  const { t } = useTranslation('database_groups');
  const activationOptions = useMemo(() => groupActivationEntries(t), [t]);
  const battleTypeOptions = useMemo(() => groupBattleTypeEntries(t), [t]);
  const systemTagsOptions = useMemo(() => systemTagsEntries(t), [t]);
  const variationOptions = useMemo(() => groupVariationEntries(t), [t]);

  const refreshUI = useRefreshUI();
  const [newGroup] = useState(bindGroup(GroupModel.createGroup(groups)));
  const [groupText] = useState({ name: '' });

  const onClickNew = () => {
    newGroup.setName(groupText.name);
    newGroup.defineRelationCustomCondition();
    setGroup({ [newGroup.dbSymbol]: newGroup }, { group: newGroup.dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('group_name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={groupText.name}
            onChange={(event) => refreshUI((groupText.name = event.target.value))}
            placeholder={t('example_name')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-activation">{t('activation')}</Label>
          <SelectCustomSimple
            id="select-activation"
            options={activationOptions}
            onChange={(value) => onActivationChange(value, newGroup, refreshUI)}
            value={getActivationValue(newGroup)}
            noTooltip
          />
          {needSwitchInput(newGroup) && (
            <InputWithLeftLabelContainer>
              <Label htmlFor="switch" required>
                {t('switch')}
              </Label>
              <Input
                type="number"
                name="switch"
                value={getSwitchValue(newGroup)}
                onChange={(event) => onSwitchInputChange(event.target.value, newGroup, refreshUI)}
              />
            </InputWithLeftLabelContainer>
          )}
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-battle-type">{t('battle_type')}</Label>
          <SelectCustomSimple
            id="select-battle-type"
            options={battleTypeOptions}
            onChange={(value) => refreshUI((newGroup.isDoubleBattle = value === 'double'))}
            value={newGroup.isDoubleBattle ? 'double' : 'simple'}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-environment">{t('environment')}</Label>
          <SelectCustomSimple
            id="select-environment"
            options={systemTagsOptions}
            onChange={(value) => refreshUI((newGroup.systemTag = value as SystemTag))}
            value={newGroup.systemTag ?? 'RegularGround'}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-variation">{t('variation')}</Label>
          <SelectCustomSimple
            id="select-variation"
            options={variationOptions}
            onChange={(value) => onVariationChange(value, newGroup, refreshUI)}
            value={getVariationValue(newGroup)}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {groupText.name.length === 0 && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={groupText.name.length === 0}>
              {t('create_group')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
