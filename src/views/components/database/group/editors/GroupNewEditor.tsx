import React, { forwardRef, useMemo, useState } from 'react';
import { Editor } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { useProjectGroups } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import {
  defineRelationCustomCondition,
  GroupActivationsMap,
  StudioGroupActivationType,
  GroupBattleTypes,
  GroupVariationsMap,
  getSwitchValue,
  onSwitchUpdateActivation,
} from '@utils/GroupUtils';
import { GROUP_NAME_TEXT_ID, GROUP_SYSTEM_TAGS, StudioGroupSystemTag, StudioGroupTool } from '@modelEntities/group';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { createGroup } from '@utils/entityCreation';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

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
  closeDialog: () => void;
};

export const GroupNewEditor = forwardRef<EditorHandlingClose, GroupNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: groups, setProjectDataValues: setGroup } = useProjectGroups();
  const { t } = useTranslation('database_groups');
  const activationOptions = useMemo(() => groupActivationEntries(t), [t]);
  const battleTypeOptions = useMemo(() => groupBattleTypeEntries(t), [t]);
  const systemTagsOptions = useMemo(() => systemTagsEntries(t), [t]);
  const variationOptions = useMemo(() => groupVariationEntries(t), [t]);
  const setText = useSetProjectText();

  const [name, setName] = useState<string>('');
  const [activation, setActivation] = useState<StudioGroupActivationType>('always');
  const [battleType, setBattleType] = useState<(typeof battleTypeOptions)[number]['value']>('simple');
  const [systemTag, setSystemTag] = useState<StudioGroupSystemTag>('Grass');
  const [variation, setVariation] = useState<(typeof variationOptions)[number]['value']>('0');
  const [switchId, setSwitchId] = useState(1);
  const [stepsAverage, setStepsAverage] = useState<number>(30);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const id = findFirstAvailableId(groups, 0);
    const dbSymbol = `group_${id}` as DbSymbol;
    const tool = isTool(variation) ? variation : null;
    const terrainTag = tool ? 0 : Number(variation);
    const activationSwitchId = activation === 'custom' ? switchId : Number(activation);

    const group = createGroup(
      dbSymbol,
      id,
      systemTag,
      terrainTag,
      tool,
      battleType === 'double',
      activation === 'always' ? undefined : { value: activationSwitchId, type: 'enabledSwitch', relationWithPreviousCondition: 'AND' },
      stepsAverage
    );
    group.customConditions = defineRelationCustomCondition(group.customConditions);
    setText(GROUP_NAME_TEXT_ID, group.id, name);
    setGroup({ [dbSymbol]: group }, { group: dbSymbol });
    closeDialog();
  };

  const canNew = () => {
    if (!name) return false;
    if (isNaN(stepsAverage) || stepsAverage < 0 || stepsAverage > 999) return false;
    if (isNaN(switchId) || switchId < 1 || switchId > 99999) return false;

    return true;
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
              onChange={(value) => {
                setActivation(value as StudioGroupActivationType);
                setSwitchId(getSwitchValue(value as StudioGroupActivationType));
              }}
              value={activation}
              noTooltip
            />
            {activation === 'custom' && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="switch" required>
                  {t('switch')}
                </Label>
                <Input
                  type="number"
                  name="switch"
                  min="1"
                  max="99999"
                  value={isNaN(switchId) ? '' : switchId}
                  onChange={(event) => {
                    const newValue = event.target.valueAsNumber;
                    setSwitchId(newValue);
                    setActivation(onSwitchUpdateActivation(newValue));
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
          <Label htmlFor="steps-average" required>
            {t('steps_average')}
          </Label>
          <Input
            name="steps-average"
            type="number"
            min={0}
            max={999}
            step={1}
            value={isNaN(stepsAverage) ? '' : stepsAverage}
            onChange={(event) => setStepsAverage(event.target.valueAsNumber)}
          />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <ToolTipContainer>
            {!canNew() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={!canNew()}>
              {t('create_group')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
GroupNewEditor.displayName = 'GroupNewEditor';
