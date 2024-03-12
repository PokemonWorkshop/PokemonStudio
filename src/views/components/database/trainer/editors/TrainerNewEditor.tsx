import React, { ChangeEvent, forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';
import { useProjectTrainers } from '@utils/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import {
  StudioTrainerVsType,
  TRAINER_AI_CATEGORIES,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { createTrainer } from '@utils/entityCreation';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const aiCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_AI_CATEGORIES.map((category, index) => ({ value: (index + 1).toString(), label: `${padStr(index + 1, 2)} - ${t(category)}` }));

const vsTypeCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_VS_TYPE_CATEGORIES.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

type TrainerNewEditorProps = {
  closeDialog: () => void;
};

export const TrainerNewEditor = forwardRef<EditorHandlingClose, TrainerNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: trainers, setProjectDataValues: setTrainer } = useProjectTrainers();
  const { t } = useTranslation('database_trainers');
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [trainerClass, setTrainerClass] = useState(''); // We can't use a ref because of the button behavior
  const [ai, setAi] = useState(1);
  const [vsType, setVsType] = useState<StudioTrainerVsType>(1);
  const battleIdRef = useRef<HTMLInputElement>(null);
  const [battleIdError, setBattleIdError] = useState<'value' | undefined>(undefined);
  const baseMoneyRef = useRef<HTMLInputElement>(null);
  const [baseMoneyError, setBaseMoneyError] = useState<'value' | undefined>(undefined);
  const setText = useSetProjectText();

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    if (!baseMoneyRef.current || !battleIdRef.current) return;

    const newTrainer = createTrainer(trainers, ai, vsType, battleIdRef.current.valueAsNumber, baseMoneyRef.current.valueAsNumber);
    setText(TRAINER_CLASS_TEXT_ID, newTrainer.id, trainerClass);
    setText(TRAINER_NAME_TEXT_ID, newTrainer.id, name);
    setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, newTrainer.id, '');
    setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, newTrainer.id, '');
    setTrainer({ [newTrainer.dbSymbol]: newTrainer }, { trainer: newTrainer.dbSymbol });
    closeDialog();
  };

  const onBaseMoneyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.valueAsNumber;
    if (isNaN(value) || value < 0 || value > 99999) {
      if (!baseMoneyError) setBaseMoneyError('value');
    } else {
      if (baseMoneyError) setBaseMoneyError(undefined);
    }
  };

  const onBattleIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.valueAsNumber;
    if (isNaN(value) || value < 0 || value > 9999) {
      if (!battleIdError) setBattleIdError('value');
    } else {
      if (battleIdError) setBattleIdError(undefined);
    }
  };

  const checkDisabled = () => !name || !trainerClass || !!baseMoneyError || !!battleIdError;

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="trainer-name" required>
            {t('trainer_name')}
          </Label>
          <Input type="text" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('example_trainer_name')} />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="trainer-class" required>
            {t('trainer_class')}
          </Label>
          <Input
            type="text"
            name="name"
            value={trainerClass}
            onChange={(event) => setTrainerClass(event.target.value)}
            placeholder={t('example_trainer_class')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-ai-level">{t('ai_level')}</Label>
          <SelectCustomSimple id="select-ai-level" options={aiOptions} onChange={(value) => setAi(Number(value))} value={ai.toString()} noTooltip />
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
          <Input type="number" name="battle-id" min="0" max="9999" defaultValue={0} ref={battleIdRef} onChange={onBattleIdChange} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="base-money">{t('base_money')}</Label>
          <Input type="number" name="base-money" min="0" max="99999" defaultValue={10} ref={baseMoneyRef} onChange={onBaseMoneyChange} />
        </InputWithLeftLabelContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_trainer')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
TrainerNewEditor.displayName = 'TrainerNewEditor';
