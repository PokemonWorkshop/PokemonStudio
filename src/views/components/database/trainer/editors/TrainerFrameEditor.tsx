import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { EditorWithCollapse } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import styled from 'styled-components';
import { Tag } from '@components/Tag';
import { padStr } from '@utils/PadStr';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import {
  getTrainerMoney,
  StudioTrainerVsType,
  TRAINER_AI_CATEGORIES,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useTrainerPage } from '@hooks/usePage';
import { useUpdateTrainer } from './useUpdateTrainer';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { TrainerTranslationOverlay, TrainerTranslationEditorTitle } from './TrainerTranslationOverlay';

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

const aiCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_AI_CATEGORIES.map((category, index) => ({ value: (index + 1).toString(), label: `${padStr(index + 1, 2)} - ${t(category)}` }));

const vsTypeCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_VS_TYPE_CATEGORIES.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

export const TrainerFrameEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_trainers');
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const dialogsRef = useDialogsRef<TrainerTranslationEditorTitle>();
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const trainerNameRef = useRef<HTMLInputElement>(null);
  const trainerClassRef = useRef<HTMLInputElement>(null);
  const battleIdRef = useRef<HTMLInputElement>(null);
  const [baseMoney, setBaseMoney] = useState<number>(trainer.baseMoney);
  const [aiLevel, setAiLevel] = useState<number>(trainer.ai);
  const [vsType, setVsType] = useState<StudioTrainerVsType>(trainer.vsType);

  const saveTexts = () => {
    if (!trainerNameRef.current || !trainerClassRef.current) return;

    setText(TRAINER_NAME_TEXT_ID, trainer.id, trainerNameRef.current.value);
    setText(TRAINER_CLASS_TEXT_ID, trainer.id, trainerClassRef.current.value);
  };

  const canClose = () => {
    const result = !!trainerNameRef.current?.value && !!trainerClassRef.current?.value && !!battleIdRef.current?.validity.valid;
    return result && (isNaN(baseMoney) || (baseMoney >= 0 && baseMoney <= 99999)) && !dialogsRef.current?.currentDialog;
  };

  const onClose = () => {
    if (!battleIdRef.current || !canClose()) return;

    updateTrainer({
      battleId: battleIdRef.current.value === '' ? trainer.battleId : battleIdRef.current.valueAsNumber,
      baseMoney: isNaN(baseMoney) ? trainer.baseMoney : baseMoney,
      ai: aiLevel,
      vsType: vsType,
    });
    saveTexts();
  };

  useEditorHandlingClose(ref, onClose, canClose);

  const handleTranslateClick = (editorTitle: TrainerTranslationEditorTitle) => () => {
    saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };

  const onTranslationOverlayClose = () => {
    if (!trainerNameRef.current || !trainerClassRef.current) return;

    trainerNameRef.current.value = trainerNameRef.current.defaultValue;
    trainerClassRef.current.value = trainerClassRef.current.defaultValue;
  };

  return (
    <EditorWithCollapse type="edit" title={t('informations')}>
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
            <Label htmlFor="trainer-class" required>
              {t('trainer_class')}
            </Label>
            <TranslateInputContainer onTranslateClick={handleTranslateClick('translation_class')}>
              <Input
                type="text"
                name="name"
                defaultValue={getText(TRAINER_CLASS_TEXT_ID, trainer.id)}
                ref={trainerClassRef}
                placeholder={t('example_trainer_class')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-ai-level">{t('ai_level')}</Label>
            <SelectCustomSimple
              id="select-ai-level"
              options={aiOptions}
              onChange={(value) => setAiLevel(Number(value))}
              value={aiLevel.toString()}
              noTooltip
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
