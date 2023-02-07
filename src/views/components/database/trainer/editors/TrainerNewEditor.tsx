import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PictureInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import styled from 'styled-components';
import { DropInput } from '@components/inputs/DropInput';
import { basename } from '@utils/path';
import { padStr } from '@utils/PadStr';
import { useProjectTrainers } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useGlobalState } from '@src/GlobalStateProvider';
import { showNotification } from '@utils/showNotification';
import {
  TRAINER_AI_CATEGORIES,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { useSetProjectText } from '@utils/ReadingProjectText';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { createTrainer } from '@utils/entityCreation';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const WaitingPicture = styled.div`
  display: flex;
  height: 160px;
`;

const aiCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_AI_CATEGORIES.map((category, index) => ({ value: (index + 1).toString(), label: `${padStr(index + 1, 2)} - ${t(category)}` }));

const vsTypeCategoryEntries = (t: TFunction<'database_trainers'>) =>
  TRAINER_VS_TYPE_CATEGORIES.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

type TrainerNewEditorProps = {
  onClose: () => void;
};

export const TrainerNewEditor = ({ onClose }: TrainerNewEditorProps) => {
  const [state] = useGlobalState();
  const { projectDataValues: trainers, setProjectDataValues: setTrainer } = useProjectTrainers();
  const { t } = useTranslation('database_trainers');
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const [spriteDp, setSpriteDp] = useState(false);
  const [spriteBig, setSpriteBig] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [battlerName, setBattlerName] = useState('');
  const [name, setName] = useState('');
  const [tClass, setTClass] = useState('');
  const [ai, setAi] = useState(1);
  const [vsType, setVsType] = useState(1);
  const battleIdRef = useRef<HTMLInputElement>(null);
  const [battleIdError, setBattleIdError] = useState<'value' | undefined>(undefined);
  const baseMoneyRef = useRef<HTMLInputElement>(null);
  const [baseMoneyError, setBaseMoneyError] = useState<'value' | undefined>(undefined);
  const setText = useSetProjectText();

  useEffect(() => {
    if (!isLoading) return;

    window.api.fileExists(
      { filePath: `${state.projectPath}/graphics/battlers/${battlerName}.png` },
      ({ result }) => {
        setSpriteDp(result);
        window.api.fileExists(
          { filePath: `${state.projectPath}/graphics/battlers/${battlerName}_big.png` },
          ({ result: resultBig }) => {
            setSpriteBig(resultBig);
            setLoading(false);
          },
          ({ errorMessage }) => showNotification('danger', t('error'), errorMessage)
        );
      },
      ({ errorMessage }) => showNotification('danger', t('error'), errorMessage)
    );
    return () => window.api.cleanupFileExists();
  }, [battlerName, isLoading]);

  const onBattlerChoosen = (battlerPath: string) => {
    const battler = basename(battlerPath)
      .split('.')[0]
      .replace(/_big|_sma/, '');
    setBattlerName(battler);
    setLoading(true);
  };

  const getSprite = () => {
    if (spriteBig) return `${state.projectPath}/graphics/battlers/${battlerName}_big.png`;
    if (spriteDp) return `${state.projectPath}/graphics/battlers/${battlerName}.png`;
    return 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'; // placeholder here
  };

  const onClickNew = () => {
    if (!baseMoneyRef.current || !battleIdRef.current) return;
    const id = findFirstAvailableId(trainers, 0);
    const dbSymbol = `trainer_${id}` as DbSymbol;
    const trainer = createTrainer(
      dbSymbol,
      id,
      ai,
      vsType as 1 | 2 | 3,
      battleIdRef.current.valueAsNumber,
      baseMoneyRef.current.valueAsNumber,
      battlerName
    );
    setText(TRAINER_CLASS_TEXT_ID, id, tClass);
    setText(TRAINER_NAME_TEXT_ID, id, name);
    setText(TRAINER_VICTORY_SENTENCE_TEXT_ID, id, '');
    setText(TRAINER_DEFEAT_SENTENCE_TEXT_ID, id, '');
    setTrainer({ [dbSymbol]: trainer }, { trainer: dbSymbol });
    onClose();
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
    if (isNaN(value) || value < 0) {
      if (!battleIdError) setBattleIdError('value');
    } else {
      if (battleIdError) setBattleIdError(undefined);
    }
  };

  const checkDisabled = () => !name || !tClass || !battlerName || !!baseMoneyError || !!battleIdError;

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
            value={tClass}
            onChange={(event) => setTClass(event.target.value)}
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
            onChange={(value) => setVsType(Number(value))}
            value={vsType.toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="battle-id">
            <ToolTipContainer>
              <ToolTip bottom="100%">{t('battle_id_tooltip')}</ToolTip>
              {t('battle_id')}
            </ToolTipContainer>
          </Label>
          <Input type="number" name="battle-id" min="0" defaultValue={0} ref={battleIdRef} onChange={onBattleIdChange} />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="battler" required>
            {t('trainer_sprite')}
          </Label>
          {!battlerName ? (
            <DropInput name={t('trainer_sprite')} extensions={['png']} onFileChoosen={onBattlerChoosen} />
          ) : !isLoading ? (
            <PictureInput
              name={t('trainer_sprite')}
              picturePath={getSprite()}
              onIconClear={() => setBattlerName('')}
              pixelated={!spriteBig && spriteDp}
            />
          ) : (
            <WaitingPicture />
          )}
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="base-money">{t('base_money')}</Label>
          <Input type="number" name="base-money" min="0" max="99999" defaultValue={10} ref={baseMoneyRef} onChange={onBaseMoneyChange} />
        </InputWithLeftLabelContainer>

        <ButtonContainer>
          <ToolTipContainer>
            {checkDisabled() && <ToolTip bottom="100%">{t('fields_asterisk_required')}</ToolTip>}
            <PrimaryButton onClick={onClickNew} disabled={checkDisabled()}>
              {t('create_trainer')}
            </PrimaryButton>
          </ToolTipContainer>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
