import React, { useEffect, useMemo, useState } from 'react';
import { EditorWithCollapse, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import {
  Input,
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
  PaddedInputContainer,
  TrainerPictureInput,
} from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { InputGroupCollapse } from '@components/inputs/InputContainerCollapse';
import styled from 'styled-components';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { Tag } from '@components/Tag';
import { DropInput } from '@components/inputs/DropInput';
import { basename, trainerSpriteBigPath, trainerSpritePath } from '@utils/path';
import { padStr } from '@utils/PadStr';
import { useGlobalState } from '@src/GlobalStateProvider';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import type { OpenTranslationEditorFunction } from '@utils/useTranslationEditor';
import { TranslateInputContainer } from '@components/inputs/TranslateInputContainer';
import { showNotification } from '@utils/showNotification';
import {
  getTrainerMoney,
  StudioTrainer,
  TRAINER_AI_CATEGORIES,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VS_TYPE_CATEGORIES,
} from '@modelEntities/trainer';
import { useGetProjectText, useSetProjectText } from '@utils/ReadingProjectText';

const BaseMoneyInfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

const WaitingPicture = styled.div`
  display: flex;
  height: 160px;
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

type TrainerFrameEditorProps = {
  trainer: StudioTrainer;
  openTranslationEditor: OpenTranslationEditorFunction;
};

export const TrainerFrameEditor = ({ trainer, openTranslationEditor }: TrainerFrameEditorProps) => {
  const [state] = useGlobalState();
  const { t } = useTranslation('database_trainers');
  const aiOptions = useMemo(() => aiCategoryEntries(t), [t]);
  const vsTypeOptions = useMemo(() => vsTypeCategoryEntries(t), [t]);
  const [spriteDp, setSpriteDp] = useState(false);
  const [spriteBig, setSpriteBig] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const setText = useSetProjectText();
  const getText = useGetProjectText();
  const refreshUI = useRefreshUI();

  useEffect(() => {
    if (!isLoading) return;

    window.api.fileExists(
      { filePath: trainerSpritePath(trainer, state.projectPath) },
      ({ result }) => {
        setSpriteDp(result);
        window.api.fileExists(
          { filePath: trainerSpriteBigPath(trainer, state.projectPath) },
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
  }, [trainer, isLoading]);

  const onBattlerChoosen = (battlerPath: string) => {
    const battler = basename(battlerPath)
      .split('.')[0]
      .replace(/_big|_sma/, '');
    if (trainer.battlers[0]) refreshUI((trainer.battlers[0] = battler));
    else refreshUI(trainer.battlers.push(battler));
    setLoading(true);
  };

  const getSprite = () => {
    if (spriteBig) return trainerSpriteBigPath(trainer);
    if (spriteDp) return trainerSpritePath(trainer);
    return '';
  };

  return (
    <EditorWithCollapse type="edit" title={t('informations')}>
      <InputContainer>
        <PaddedInputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="trainer-name" required>
              {t('trainer_name')}
            </Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_name')}>
              <Input
                type="text"
                name="name"
                value={getText(TRAINER_NAME_TEXT_ID, trainer.id)}
                onChange={(event) => refreshUI(setText(TRAINER_NAME_TEXT_ID, trainer.id, event.target.value))}
                placeholder={t('example_trainer_name')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="trainer-class" required>
              {t('trainer_class')}
            </Label>
            <TranslateInputContainer onTranslateClick={() => openTranslationEditor('translation_class')}>
              <Input
                type="text"
                name="name"
                value={getText(TRAINER_CLASS_TEXT_ID, trainer.id)}
                onChange={(event) => refreshUI(setText(TRAINER_CLASS_TEXT_ID, trainer.id, event.target.value))}
                placeholder={t('example_trainer_class')}
              />
            </TranslateInputContainer>
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-ai-level">{t('ai_level')}</Label>
            <SelectCustomSimple
              id="select-ai-level"
              options={aiOptions}
              onChange={(value) => refreshUI((trainer.ai = Number(value)))}
              value={trainer.ai.toString()}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="select-vs-type">{t('vs_type')}</Label>
            <SelectCustomSimple
              id="select-vs-type"
              options={vsTypeOptions}
              onChange={(value) => refreshUI((trainer.vsType = Number(value) as 1))}
              value={trainer.vsType.toString()}
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
              value={isNaN(trainer.battleId) ? '' : trainer.battleId}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 9999) return event.preventDefault();
                refreshUI((trainer.battleId = newValue));
              }}
              onBlur={() => refreshUI((trainer.battleId = cleanNaNValue(trainer.battleId)))}
            />
          </InputWithLeftLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="battler" required>
              {t('trainer_sprite')}
            </Label>
            {trainer.battlers.length === 0 || (!spriteDp && !spriteBig) ? (
              <DropInput destFolderToCopy="graphics/battlers" name={t('trainer_sprite')} extensions={['png']} onFileChoosen={onBattlerChoosen} />
            ) : !isLoading ? (
              <TrainerPictureInput
                name={t('trainer_sprite')}
                picturePath={getSprite()}
                onIconClear={() => refreshUI(trainer.battlers.pop())}
                pixelated={!spriteBig && spriteDp}
              />
            ) : (
              <WaitingPicture />
            )}
          </InputWithTopLabelContainer>
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
                value={isNaN(trainer.baseMoney) ? '' : trainer.baseMoney}
                onChange={(event) => {
                  const newValue = event.target.value === '' ? Number.NaN : parseInt(event.target.value);
                  if (newValue < 0 || newValue > 99999) return event.preventDefault();
                  refreshUI((trainer.baseMoney = newValue));
                }}
                onBlur={() => refreshUI((trainer.baseMoney = cleanNaNValue(trainer.baseMoney)))}
              />
            </InputWithLeftLabelContainer>
            <BaseMoneyInfoContainer>{t('base_money_info')}</BaseMoneyInfoContainer>
            <MoneyContainer>
              <span className="title">{t('money_title')}</span>
              <Tag>{`${getTrainerMoney(trainer)} P$`}</Tag>
            </MoneyContainer>
          </PaddedInputContainer>
        </InputGroupCollapse>
      </InputContainer>
    </EditorWithCollapse>
  );
};
