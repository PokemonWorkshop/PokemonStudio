import { EditorWithCollapse } from '@components/editor';
import React, { forwardRef, useMemo, useRef, useState } from 'react';

import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { SelectCustomSimple, SelectCustomWithInput } from '@components/SelectCustom';
import { SelectTrainerClass } from '@components/selects';
import { Tag } from '@components/Tag';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useTrainerPage } from '@hooks/usePage';
import { DbSymbol } from '@modelEntities/dbSymbol';
import {
  getTrainerMoney,
  StudioTrainerAICategoryType,
  StudioTrainerVsType,
  TRAINER_AI_CATEGORIES,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { padStr } from '@utils/PadStr';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TrainerTranslationEditorTitle, TrainerTranslationOverlay } from './TrainerTranslationOverlay';
import { useUpdateTrainer } from './useUpdateTrainer';

const BaseMoneyInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const MoneyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;

  & span.title {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text400};
  }

  & ${Tag} {
    background-color: ${({ theme }) => theme.colors.dark20};
  }
`;

const aiCategoryEntries = (t: TFunction) =>
  TRAINER_AI_CATEGORIES.map((category) => ({ value: category.value, label: `${padStr(Number(category.value), 2)} - ${t(category.label)}` }));

const vsTypeCategoryEntries = (t: TFunction) =>
  TRAINER_VS_TYPE_CATEGORIES.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

export const TrainerFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const dialogsRef = useDialogsRef<TrainerTranslationEditorTitle>();
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const trainerNameRef = useRef<HTMLInputElement>(null);
  const battleIdRef = useRef<HTMLInputElement>(null);
  const [classSymbol, setClassSymbol] = useState<DbSymbol>(trainer.classSymbol);
  const [baseMoney, setBaseMoney] = useState<number>(trainer.baseMoney);
  const [aiCategory, setAiCategory] = useState<StudioTrainerAICategoryType>(
    (trainer.ai > 7 ? 'custom' : trainer.ai.toString()) as StudioTrainerAICategoryType,
  );
  const [aiLevel, setAiLevel] = useState<number>(trainer.ai);
  const [vsType, setVsType] = useState<StudioTrainerVsType>(trainer.vsType);

  const saveTexts = () => {
    if (!trainerNameRef.current) return;

    setText(TRAINER_NAME_TEXT_ID, trainer.id, trainerNameRef.current.value, true);
  };

  const canClose = () => {
    if (aiLevel < 1 || aiLevel > 99999) return false;
    const result = !!trainerNameRef.current?.value && classSymbol !== '__undef__' && !!battleIdRef.current?.validity.valid;
    return result && (isNaN(baseMoney) || (baseMoney >= 0 && baseMoney <= 99999)) && !dialogsRef.current?.currentDialog;
  };

  const onClose = () => {
    if (!battleIdRef.current || !canClose()) return;

    updateTrainer({
      battleId: battleIdRef.current.value === '' ? trainer.battleId : battleIdRef.current.valueAsNumber,
      baseMoney: isNaN(baseMoney) ? trainer.baseMoney : baseMoney,
      ai: aiLevel,
      vsType: vsType,
      classSymbol,
    });
    saveTexts();
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TrainerTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!trainerNameRef.current) return;

    trainerNameRef.current.value = trainerNameRef.current.defaultValue;
  };

  const handleTrainerAiLevelChange = (value: string) => {
    setAiCategory(value as StudioTrainerAICategoryType);
    setAiLevel(value === 'custom' ? 8 : Number(value));
  };

  return (
    <EditorWithCollapse type="edit" title={t('information')}>
      <InputContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="trainer-name" required>
              {t('trainer_name')}
            </Label>
            <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_name')}>
              <Input
                type="text"
                name="name"
                defaultValue={getText(TRAINER_NAME_TEXT_ID, trainer.id)}
                ref={trainerNameRef}
                placeholder={t('example_trainer_name')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label>{t('trainer_class')}</Label>
            <SelectTrainerClass dbSymbol={classSymbol} onChange={(dbSymbol) => setClassSymbol(dbSymbol as DbSymbol)} noLabel />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-ai-level">{t('ai_level')}</Label>
            <SelectCustomWithInput
              value={aiCategory}
              selectCustomLabel={t('custom')}
              onSelectValueChange={handleTrainerAiLevelChange}
              inputLabel={t('ai_level_custom')}
              minInput="1"
              maxInput="99999"
              defaultCustomValue={aiLevel.toString()}
              setCustomValue={(value) => setAiLevel(Number(value))}
              selectOptions={aiOptions}
            />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-vs-type">{t('vs_type')}</Label>
            <SelectCustomSimple
              id="select-vs-type"
              options={vsTypeOptions}
              onChange={(value) => setVsType(Number(value) as StudioTrainerVsType)}
              value={vsType.toString()}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="battle-id" data-tooltip={t('battle_id_tooltip')}>
              {t('battle_id')}
            </Label>
            <Input type="number" name="battle-id" min="0" max="9999" defaultValue={trainer.battleId} ref={battleIdRef} />
          </InputWithLeftLabelContainer>
        </PaddedInputContainer>
        <InputGroupCollapse title={t('money')} gap="16px" collapseByDefault>
          <PaddedInputContainer size="s">
            <InputWithLeftLabelContainer>
              <Label htmlFor="base-money">{t('base_money')}</Label>
              <Input
                type="number"
                name="base-money"
                min="0"
                max="99999"
                value={baseMoney}
                onChange={(event) => setBaseMoney(event.currentTarget.valueAsNumber)}
              />
            </InputWithLeftLabelContainer>
            <BaseMoneyInfoContainer>{t('base_money_info')}</BaseMoneyInfoContainer>
            <MoneyContainer>
              <span className="title">{t('money_title')}</span>
              <Tag>{`${getTrainerMoney({ ...trainer, baseMoney })} P$`}</Tag>
            </MoneyContainer>
          </PaddedInputContainer>
        </InputGroupCollapse>
      </InputContainer>
      <TrainerTranslationOverlay trainer={trainer} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </EditorWithCollapse>
  );
});
TrainerFrameEditor.displayName = 'TrainerFrameEditor';
