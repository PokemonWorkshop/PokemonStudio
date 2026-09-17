import React, { ChangeEvent, forwardRef, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, Toggle } from '@components/inputs';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import { SelectCustomSimple, SelectCustomWithInput } from '@components/SelectCustom';
import { SelectTrainer } from '@components/selects';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';
import { useProjectTrainers } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import {
  StudioTrainerVsType,
  StudioTrainerAICategoryType,
  TRAINER_AI_CATEGORIES,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { useSetProjectText, useGetProjectText, useCopyProjectText } from '@utils/ReadingProjectText';
import { createTrainer } from '@utils/entityCreation';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';
import { importTrainerData } from '@utils/importEntityDataUtils';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const ImportInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ImportInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const aiCategoryEntries = (t: TFunction) =>
  TRAINER_AI_CATEGORIES.map((category) => ({ value: category.value, label: `${padStr(Number(category.value), 2)} - ${t(category.label)}` }));

const vsTypeCategoryEntries = (t: TFunction) =>
  TRAINER_VS_TYPE_CATEGORIES.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

type TrainerNewEditorProps = {
  closeDialog: () => void;
};

export const TrainerNewEditor = forwardRef<EditorHandlingClose, TrainerNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: trainers, setProjectDataValues: setTrainer } = useProjectTrainers();
  const { t } = useTranslation();
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const [name, setName] = useState(''); // We can't use a ref because of the button behavior
  const [trainerClass, setTrainerClass] = useState(''); // We can't use a ref because of the button behavior
  const [aiCategory, setAiCategory] = useState<StudioTrainerAICategoryType>('1');
  const [ai, setAi] = useState(1);
  const [vsType, setVsType] = useState<StudioTrainerVsType>(1);
  const battleIdRef = useRef<HTMLInputElement>(null);
  const [battleIdError, setBattleIdError] = useState<'value' | undefined>(undefined);
  const baseMoneyRef = useRef<HTMLInputElement>(null);
  const [baseMoneyError, setBaseMoneyError] = useState<'value' | undefined>(undefined);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const copyText = useCopyProjectText();
  const [selectedTrainer, setSelectedTrainer] = useState('__undef__');
  const [importing, setImporting] = useState(false);
  const [preserveTextData, setPreserveTextData] = useState(false);

  useEditorHandlingClose(ref);

  const classLockedByImport = importing && selectedTrainer !== '__undef__' && preserveTextData;

  const prefillFromTrainer = (dbSymbol: string) => {
    if (dbSymbol === '__undef__') return;
    const sourceTrainer = trainers[dbSymbol];
    // Keep whatever the user already typed as the name; the class is always synced since it's locked while preserving
    if (!name) setName(getText(TRAINER_NAME_TEXT_ID, sourceTrainer.id));
    setTrainerClass(getText(TRAINER_CLASS_TEXT_ID, sourceTrainer.id));
  };

  const onTrainerToImportChange = (dbSymbol: string) => {
    setSelectedTrainer(dbSymbol);
    if (preserveTextData) prefillFromTrainer(dbSymbol);
  };

  const onPreserveTextDataChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    setPreserveTextData(checked);
    if (checked) prefillFromTrainer(selectedTrainer);
  };

  // Copies a text across every project language from an existing entity's row to the new trainer's row, then
  // re-applies currentLanguageValue on top so the current language always reflects what's shown in the dialog
  // (setText is called first to guarantee the destination row exists before copyText writes into it)
  const preserveText = (fileId: number, srcId: number, destId: number, currentLanguageValue: string) => {
    setText(fileId, destId, currentLanguageValue);
    copyText({ fileId, textId: srcId + 1 }, { fileId, textId: destId + 1 });
    setText(fileId, destId, currentLanguageValue);
  };

  const onClickNew = () => {
    if (!baseMoneyRef.current || !battleIdRef.current) return;

    let newTrainer = createTrainer(trainers, ai, vsType, battleIdRef.current.valueAsNumber, baseMoneyRef.current.valueAsNumber);

    if (importing && selectedTrainer !== '__undef__') {
      const sourceTrainer = trainers[selectedTrainer];
      if (preserveTextData) {
        preserveText(TRAINER_VICTORY_SENTENCE_TEXT_ID, sourceTrainer.id, newTrainer.id, getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, sourceTrainer.id));
        preserveText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, sourceTrainer.id, newTrainer.id, getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, sourceTrainer.id));
        preserveText(TRAINER_CLASS_TEXT_ID, sourceTrainer.id, newTrainer.id, trainerClass);
        preserveText(TRAINER_NAME_TEXT_ID, sourceTrainer.id, newTrainer.id, name);
      } else {
        setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, newTrainer.id, getText(TRAINER_VICTORY_SENTENCE_TEXT_ID, sourceTrainer.id));
        setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, newTrainer.id, getText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, sourceTrainer.id));
        setText(TRAINER_CLASS_TEXT_ID, newTrainer.id, trainerClass);
        setText(TRAINER_NAME_TEXT_ID, newTrainer.id, name);
      }

      newTrainer = importTrainerData(newTrainer, sourceTrainer);
    } else {
      setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, newTrainer.id, '');
      setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, newTrainer.id, '');
      setText(TRAINER_CLASS_TEXT_ID, newTrainer.id, trainerClass);
      setText(TRAINER_NAME_TEXT_ID, newTrainer.id, name);
    }

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

  const handleTrainerAiLevelChange = (value: string) => {
    setAiCategory(value as StudioTrainerAICategoryType);
    setAi(value === 'custom' ? 8 : Number(value));
  };

  return (
    <Editor type="creation" title={t('new_trainer')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="trainer-name" required>
            {t('trainer_name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('example_trainer_name')}
          />
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
            disabled={classLockedByImport}
          />
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
            defaultCustomValue={ai.toString()}
            setCustomValue={(value) => setAi(Number(value))}
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
          <Input type="number" name="battle-id" min="0" max="9999" defaultValue={0} ref={battleIdRef} onChange={onBattleIdChange} />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="base-money">{t('base_money')}</Label>
          <Input type="number" name="base-money" min="0" max="99999" defaultValue={10} ref={baseMoneyRef} onChange={onBaseMoneyChange} />
        </InputWithLeftLabelContainer>
        <InputGroupCollapse title={t('other_data')} gap="16px" onClick={() => setImporting(!importing)}>
          <ImportInfoContainer>
            <ImportInfo>{t('trainer_import_info')}</ImportInfo>
          </ImportInfoContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-trainer-to-import">{t('import_data_from')}</Label>
            <SelectTrainer dbSymbol={selectedTrainer} onChange={onTrainerToImportChange} noLabel undefValueOption={t('none_option')} />
          </InputWithTopLabelContainer>
          {selectedTrainer !== '__undef__' && (
            <ImportInfoContainer>
              <InputWithLeftLabelContainer>
                <Label htmlFor="preserve-text-data">{t('preserve_text_data')}</Label>
                <Toggle name="preserve-text-data" checked={preserveTextData} onChange={onPreserveTextDataChange} />
              </InputWithLeftLabelContainer>
              <ImportInfo>{t('preserve_text_data_info')}</ImportInfo>
            </ImportInfoContainer>
          )}
        </InputGroupCollapse>
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
