import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import {
  defineRelationCustomCondition,
  getActivationValue,
  getSwitchDefaultValue,
  getSwitchValue,
  GroupActivationsMap,
  StudioGroupActivationType,
  GroupBattleTypes,
  GroupVariationsMap,
  onSwitchUpdateActivation,
  updateActivation,
  GroupToolMap,
  isCustomEnvironment as isCustomEnvironmentFunc,
  getCustomEnvironment,
  setCustomEnvironment,
  wrongEnvironment,
} from '@utils/GroupUtils';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { useGetEntityNameText, useSetProjectText } from '@utils/ReadingProjectText';
import { GROUP_NAME_TEXT_ID, GROUP_SYSTEM_TAGS, StudioGroupSystemTag, StudioGroupTool } from '@modelEntities/group';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useGroupPage } from '@hooks/usePage';
import { useUpdateGroup } from './useUpdateGroup';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { GroupTranslationEditorTitle, GroupTranslationOverlay } from './GroupTranslationOverlay';
import { TextInputError } from '@components/inputs/Input';

const groupActivationEntries = (t: TFunction<'database_groups'>) =>
  GroupActivationsMap.map((option) => ({ value: option.value, label: t(option.label as never) }));
const groupBattleTypeEntries = (t: TFunction<'database_groups'>) => GroupBattleTypes.map((type) => ({ value: type, label: t(type) }));
const systemTagsEntries = (t: TFunction<'database_groups'>) =>
  [...GROUP_SYSTEM_TAGS, 'custom' as const].map((tag) => ({ value: tag, label: t(tag) }));
const groupVariationEntries = (t: TFunction<'database_groups'>) =>
  GroupVariationsMap.map((variation) => ({ value: variation.value, label: t(variation.label) }));
const groupToolEntries = (t: TFunction<'database_groups'>) => GroupToolMap.map((option) => ({ value: option.value, label: t(option.label) }));

export const GroupFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_groups');
  const { group } = useGroupPage();
  const updateGroup = useUpdateGroup(group);
  const dialogsRef = useDialogsRef<GroupTranslationEditorTitle>();
  const getGroupName = useGetEntityNameText();
  const setText = useSetProjectText();
  const activationOptions = useMemo(() => groupActivationEntries(t), [t]);
  const battleTypeOptions = useMemo(() => groupBattleTypeEntries(t), [t]);
  const systemTagsOptions = useMemo(() => systemTagsEntries(t), [t]);
  const variationOptions = useMemo(() => groupVariationEntries(t), [t]);
  const toolOptions = useMemo(() => groupToolEntries(t), [t]);
  const nameRef = useRef<HTMLInputElement>(null);
  const stepsAverageRef = useRef<HTMLInputElement>(null);
  const [activation, setActivation] = useState<StudioGroupActivationType>(getActivationValue(group));
  const [battleType, setBattleType] = useState<(typeof battleTypeOptions)[number]['value']>(group.isDoubleBattle ? 'double' : 'simple');
  const [systemTag, setSystemTag] = useState<StudioGroupSystemTag>(getCustomEnvironment(group.systemTag) ?? 'RegularGround');
  const [variation, setVariation] = useState(group.terrainTag.toString());
  const [tool, setTool] = useState(group.tool || 'none');
  const [switchValue, setSwitchValue] = useState<number>(getSwitchDefaultValue(group));
  const isCustomEnvironment = useMemo(() => isCustomEnvironmentFunc(systemTag), [systemTag]);
  const customEnvironmentError = systemTag !== '' && wrongEnvironment(systemTag);

  const saveTexts = () => {
    if (!nameRef.current) return;

    setText(GROUP_NAME_TEXT_ID, group.id, nameRef.current.value);
  };

  const canClose = () => {
    if (!stepsAverageRef.current || !stepsAverageRef.current.validity.valid) return false;
    if (switchValue < 1 || switchValue > 99999) return false;
    if (systemTag === '' || wrongEnvironment(systemTag)) return false;

    return !!nameRef.current?.value && !dialogsRef.current?.currentDialog;
  };

  const onClose = () => {
    if (!nameRef.current || !stepsAverageRef.current || !canClose()) return;
    setText(GROUP_NAME_TEXT_ID, group.id, nameRef.current.value);

    const customConditions = defineRelationCustomCondition(updateActivation(activation, group, switchValue));
    const newTool = tool === 'none' ? null : (tool as StudioGroupTool);
    const isDoubleBattle = battleType === 'double';
    const stepsAverage = isNaN(stepsAverageRef.current.valueAsNumber) ? group.stepsAverage : stepsAverageRef.current.valueAsNumber;
    const newSystemTag = isCustomEnvironment ? setCustomEnvironment(systemTag) : systemTag;

    updateGroup({ customConditions, systemTag: newSystemTag, tool: newTool, terrainTag: Number(variation), isDoubleBattle, stepsAverage });
    saveTexts();
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: GroupTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!nameRef.current) return;

    nameRef.current.value = nameRef.current.defaultValue;
  };

  return (
    <Editor type="edit" title={t('informations')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="name" required>
            {t('group_name')}
          </Label>
          <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
            <Input type="text" name="name" defaultValue={getGroupName(group)} ref={nameRef} placeholder={t('example_name')} />
          </TranslateInputContainer>
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-activation">{t('activation')}</Label>
          <InputContainer size="s">
            <SelectCustomSimple
              id="select-activation"
              options={activationOptions}
              onChange={(value) => {
                setActivation(value as StudioGroupActivationType);
                setSwitchValue(getSwitchValue(value as StudioGroupActivationType));
              }}
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
                  value={isNaN(switchValue) ? '' : switchValue}
                  onChange={(event) => {
                    const newValue = event.target.valueAsNumber;
                    setSwitchValue(newValue);
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
            onChange={(value) => setBattleType(value as 'double' | 'simple')}
            value={battleType}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-environment">{t('environment')}</Label>
          <SelectCustomSimple
            id="select-environment"
            options={systemTagsOptions}
            onChange={(value) => (value === 'custom' ? setSystemTag('') : setSystemTag(value))}
            value={isCustomEnvironment ? 'custom' : systemTag}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {isCustomEnvironment && (
          <InputWithTopLabelContainer>
            <Label htmlFor="custom-environment" required>
              {t('custom_environment')}
            </Label>
            <Input
              id="custom-environment"
              value={systemTag}
              onChange={(event) => setSystemTag(event.target.value)}
              placeholder="RegularGround"
              error={customEnvironmentError}
            />
            {customEnvironmentError && <TextInputError>{t('invalid_format')}</TextInputError>}
          </InputWithTopLabelContainer>
        )}
        <InputWithTopLabelContainer>
          <Label htmlFor="select-variation">{t('variation')}</Label>
          <SelectCustomSimple
            id="select-variation"
            options={variationOptions}
            onChange={(value) => setVariation(value)}
            value={variation}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-variation">{t('tool')}</Label>
          <SelectCustomSimple id="select-tool" options={toolOptions} onChange={(value) => setTool(value)} value={tool} noTooltip />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="steps-average">{t('steps_average')}</Label>
          <Input name="steps-average" type="number" min={0} max={999} step={1} defaultValue={group.stepsAverage} ref={stepsAverageRef} />
        </InputWithLeftLabelContainer>
      </InputContainer>
      <GroupTranslationOverlay group={group} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
GroupFrameEditor.displayName = 'GroupFrameEditor';
