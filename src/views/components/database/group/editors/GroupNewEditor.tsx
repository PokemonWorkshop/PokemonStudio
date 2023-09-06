import React, { useMemo, useState, useRef } from 'react';
import { Editor } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { useProjectGroups } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { defineRelationCustomCondition, GroupActivationsMap, GroupBattleTypes, GroupVariationsMap } from '@utils/GroupUtils';
import { GROUP_NAME_TEXT_ID, GROUP_SYSTEM_TAGS, StudioGroupSystemTag, StudioGroupTool } from '@modelEntities/group';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { createGroup } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { findFirstAvailableId } from '@utils/ModelUtils';

const groupActivationEntries = (t: TFunction<'database_groups'>) =>
  GroupActivationsMap.map((activation) => ({ value: activation.value, label: t(activation.label) }));
const groupBattleTypeEntries = (t: TFunction<'database_groups'>) => GroupBattleTypes.map((type) => ({ value: type, label: t(type) }));
const systemTagsEntries = (t: TFunction<'database_groups'>) => GROUP_SYSTEM_TAGS.map((tag) => ({ value: tag, label: t(tag) }));
const groupVariationEntries = (t: TFunction<'database_groups'>) =>
  GroupVariationsMap.map((variation) => ({ value: variation.value, label: t(variation.label) }));
const isTool = (variation: unknown): variation is StudioGroupTool => ['OldRod', 'GoodRod', 'SuperRod', 'RockSmash'].includes(variation as string);

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
  const { projectDataValues: groups, setProjectDataValues: setGroup } = useProjectGroups();
  const { t } = useTranslation('database_groups');
  const activationOptions = useMemo(() => groupActivationEntries(t), [t]);
  const battleTypeOptions = useMemo(() => groupBattleTypeEntries(t), [t]);
  const systemTagsOptions = useMemo(() => systemTagsEntries(t), [t]);
  const variationOptions = useMemo(() => groupVariationEntries(t), [t]);
  const setText = useSetProjectText();

  const [name, setName] = useState<string>('');
  const [activation, setActivation] = useState<(typeof activationOptions)[number]['value']>('always');
  const [battleType, setBattleType] = useState<(typeof battleTypeOptions)[number]['value']>('simple');
  const [systemTag, setSystemTag] = useState<StudioGroupSystemTag>('Grass');
  const [variation, setVariation] = useState<(typeof variationOptions)[number]['value']>('0');
  const [switchId, setSwitchId] = useState(1);
  const stepsAverageRef = useRef<HTMLInputElement>(null);

  const onClickNew = () => {
    const id = findFirstAvailableId(groups, 0);
    const dbSymbol = `group_${id}` as DbSymbol;
    const tool = isTool(variation) ? variation : null;
    const terrainTag = tool ? 0 : Number(variation);
    const activationSwitchId = activation === 'custom' ? switchId : Number(activation);

    if (!stepsAverageRef.current?.validity.valid) {
      return;
    }

    const group = createGroup(
      dbSymbol,
      id,
      systemTag,
      terrainTag,
      tool,
      battleType === 'double',
      activation === 'always' ? undefined : { value: activationSwitchId, type: 'enabledSwitch', relationWithPreviousCondition: 'AND' },
      Number(stepsAverageRef.current.value)
    );
    defineRelationCustomCondition(group);
    setText(GROUP_NAME_TEXT_ID, group.id, name);
    setGroup({ [dbSymbol]: group }, { group: dbSymbol });
    onClose();
  };

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('group_name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder={t('example_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-activation">{t('activation')}</Label>
          <InputContainer size="s">
            <SelectCustomSimple
              id="select-activation"
              options={activationOptions}
              onChange={(value) => setActivation(value as typeof activation)}
              value={activation}
              noTooltip
            />
            {activation === 'custom' && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="switch">{t('switch')}</Label>
                <Input
                  type="number"
                  name="switch"
                  min="1"
                  max="99999"
                  value={switchId || ''}
                  onChange={(event) => {
                    const newValue = parseInt(event.target.value);
                    if (newValue < 1 || newValue > 99999) return event.preventDefault();
                    setSwitchId(newValue);
                  }}
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
            onChange={(value) => setBattleType(value as typeof battleType)}
            value={battleType}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-environment">{t('environment')}</Label>
          <SelectCustomSimple
            id="select-environment"
            options={systemTagsOptions}
            onChange={(value) => setSystemTag(value as StudioGroupSystemTag)}
            value={systemTag}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-variation">{t('variation')}</Label>
          <SelectCustomSimple
            id="select-variation"
            options={variationOptions}
            onChange={(value) => setVariation(value as typeof variation)}
            value={variation}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="steps-average">{t('steps_average')}</Label>
          <Input name="steps-average" type="number" min={1} max={999} step={1} defaultValue={30} ref={stepsAverageRef} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {!name && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={!name}>
              {t('create_group')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
