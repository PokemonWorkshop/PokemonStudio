import React, { useEffect, useMemo, useState } from 'react';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PictureInput } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import TrainerModel, { AiCategories, VsTypeCategories } from '@modelEntities/trainer/Trainer.model';
import styled from 'styled-components';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { DropInput } from '@components/inputs/DropInput';
import path from 'path';
import { padStr } from '@utils/PadStr';
import { useProjectTrainers } from '@utils/useProjectData';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { useGlobalState } from '@src/GlobalStateProvider';
import { fileExists } from '@utils/IPCUtils';
import IpcService from '@services/IPC/ipc.service';

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
  AiCategories.map((category, index) => ({ value: (index + 1).toString(), label: `${padStr(index + 1, 2)} - ${t(category)}` }));

const vsTypeCategoryEntries = (t: TFunction<'database_trainers'>) =>
  VsTypeCategories.map((category) => ({ value: category.toString(), label: t(`vs_type${category}`) }));

type TrainerNewEditorProps = {
  onClose: () => void;
};

export const TrainerNewEditor = ({ onClose }: TrainerNewEditorProps) => {
  const [state] = useGlobalState();
  const { projectDataValues: trainers, setProjectDataValues: setTrainer, bindProjectDataValue: bindTrainer } = useProjectTrainers();
  const [newTrainer] = useState(bindTrainer(TrainerModel.createTrainer(trainers)));
  const [trainerText] = useState({ trainerName: '', trainerClass: '' });
  const { t } = useTranslation('database_trainers');
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const ipc = useMemo(() => new IpcService(), []);
  const [spriteDp, setSpriteDp] = useState(false);
  const [spriteBig, setSpriteBig] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const refreshUI = useRefreshUI();

  useEffect(() => {
    const checkSpriteExists = async () => {
      if (!isLoading) return;
      if (!state.projectPath) return;

      const resultDp = await fileExists(ipc, newTrainer.sprite(state.projectPath));
      if ('error' in resultDp) return console.error(resultDp.error);

      const resultBig = await fileExists(ipc, newTrainer.spriteBig(state.projectPath));
      if ('error' in resultBig) return console.error(resultBig.error);

      setSpriteDp(resultDp.fileExists);
      setSpriteBig(resultBig.fileExists);
      setLoading(false);
    };
    checkSpriteExists();
  }, [ipc, state.projectPath, newTrainer, isLoading]);

  const onBattlerChoosen = (battlerPath: string) => {
    const battler = path
      .basename(battlerPath)
      .split('.')[0]
      .replace(/_big|_sma/, '');
    if (newTrainer.battlers[0]) refreshUI((newTrainer.battlers[0] = battler));
    else refreshUI(newTrainer.battlers.push(battler));
    setLoading(true);
  };

  const getSprite = () => {
    if (!state.projectPath) return '';
    if (spriteBig) return newTrainer.spriteBig(state.projectPath);
    if (spriteDp) return newTrainer.sprite(state.projectPath);
    return 'https://www.pokepedia.fr/images/8/87/Pok%C3%A9_Ball.png'; // placeholder here
  };

  const onClickNew = () => {
    newTrainer.setTrainerClassName(trainerText.trainerClass);
    newTrainer.setTrainerName(trainerText.trainerName);
    newTrainer.setVictorySentence('');
    newTrainer.setDefeatSentence('');
    setTrainer({ [newTrainer.dbSymbol]: newTrainer }, { trainer: newTrainer.dbSymbol });
    onClose();
  };

  const checkDisabled = () => trainerText.trainerClass === '' || trainerText.trainerName === '' || newTrainer.battlers.length === 0;

  return (
    <Editor type="creation" title={t('new')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="trainer-name" required>
            {t('trainer_name')}
          </Label>
          <Input
            type="text"
            name="name"
            value={trainerText.trainerName}
            onChange={(event) => refreshUI((trainerText.trainerName = event.target.value))}
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
            value={trainerText.trainerClass}
            onChange={(event) => refreshUI((trainerText.trainerClass = event.target.value))}
            placeholder={t('example_trainer_class')}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-ai-level">{t('ai_level')}</Label>
          <SelectCustomSimple
            id="select-ai-level"
            options={aiOptions}
            onChange={(value) => refreshUI((newTrainer.ai = Number(value)))}
            value={newTrainer.ai.toString()}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="select-vs-type">{t('vs_type')}</Label>
          <SelectCustomSimple
            id="select-vs-type"
            options={vsTypeOptions}
            onChange={(value) => refreshUI((newTrainer.vsType = Number(value)))}
            value={newTrainer.vsType.toString()}
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
          <Input
            type="number"
            name="battle-id"
            min="0"
            max="9999"
            value={isNaN(newTrainer.battleId) ? '' : newTrainer.battleId}
            onChange={(event) => {
              const newValue = event.target.value === '' ? 0 : parseInt(event.target.value);
              if (newValue < 0 || newValue > 9999) return event.preventDefault();
              refreshUI((newTrainer.battleId = newValue));
            }}
            onBlur={() => refreshUI((newTrainer.battleId = cleanNaNValue(newTrainer.battleId)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="battler" required>
            {t('trainer_sprite')}
          </Label>
          {newTrainer.battlers.length === 0 ? (
            <DropInput name={t('trainer_sprite')} extensions={['png']} onFileChoosen={onBattlerChoosen} />
          ) : !isLoading ? (
            <PictureInput
              name={t('trainer_sprite')}
              picturePath={getSprite()}
              onIconClear={() => refreshUI(newTrainer.battlers.pop())}
              pixelated={!spriteBig && spriteDp}
            />
          ) : (
            <WaitingPicture />
          )}
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="base-money">{t('base_money')}</Label>
          <Input
            type="number"
            name="base-money"
            min="0"
            max="99999"
            value={isNaN(newTrainer.baseMoney) ? '' : newTrainer.baseMoney}
            onChange={(event) => {
              const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
              if (newValue < 0 || newValue > 99999) return event.preventDefault();
              refreshUI((newTrainer.baseMoney = newValue));
            }}
            onBlur={() => refreshUI((newTrainer.baseMoney = cleanNaNValue(newTrainer.baseMoney)))}
          />
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
