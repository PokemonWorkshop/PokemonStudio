import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataBlockContainer,
  DataFieldsetField,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import styled from 'styled-components';
import { useGlobalState } from '@src/GlobalStateProvider';
import { padStr } from '@utils/PadStr';
import { TrainerCategory } from '@components/categories';
import { showNotification } from '@utils/showNotification';
import { useGetEntityNameText, useGetProjectText } from '@utils/ReadingProjectText';
import { getTrainerMoney, StudioTrainer, TRAINER_AI_CATEGORIES, TRAINER_CLASS_TEXT_ID } from '@modelEntities/trainer';
import { trainerSpriteBigPath, trainerSpritePath } from '@utils/path';
import { ResourceImage } from '@components/ResourceImage';

type TrainerFrameProps = {
  trainer: StudioTrainer;
  onClick: () => void;
};

const DataGridTrainer = styled(DataGrid)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: grid;
    grid-template-columns: minmax(min-content, 1024px);
    grid-auto-flow: row;
  }
`;

const TrainerInfoContainer = styled(DataInfoContainer)`
  gap: 20px;
`;

const TrainerSubInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
`;

type TrainerSpriteProps = {
  show: string;
};

const TrainerSpriteContainer = styled.div.attrs<TrainerSpriteProps>((props) => ({
  'data-show': props.show,
}))<TrainerSpriteProps>`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: right;
  height: 160px;

  &[data-show='not-show'] {
    display: none;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    justify-content: left;
  }

  & .sprite-dp {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background-color: ${({ theme }) => theme.colors.dark15};
    border-radius: 4px;
  }

  & .sprite-big {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 284px;
    height: 160px;
    background-color: ${({ theme }) => theme.colors.dark15};
    border-radius: 4px;

    & img {
      image-rendering: auto;
    }
  }

  & img {
    object-fit: cover;
    image-rendering: pixelated;
    width: 100%;
    height: 100%;
  }
`;

export const TrainerFrame = ({ trainer, onClick }: TrainerFrameProps) => {
  const { t } = useTranslation('database_trainers');
  const [state] = useGlobalState();
  const getTrainerName = useGetEntityNameText();
  const getText = useGetProjectText();
  const [spriteDp, setSpriteDp] = useState(false);
  const [spriteBig, setSpriteBig] = useState(false);
  const [initial, setInitial] = useState(true);

  const trainerName = useMemo(() => `${getText(TRAINER_CLASS_TEXT_ID, trainer.id)} ${getTrainerName(trainer)}`, [trainer]);

  useEffect(() => {
    window.api.fileExists(
      { filePath: trainerSpritePath(trainer, state.projectPath) },
      ({ result }) => {
        setSpriteDp(result);
        window.api.fileExists(
          { filePath: trainerSpriteBigPath(trainer, state.projectPath) },
          ({ result: resultBig }) => {
            setSpriteBig(resultBig);
            setInitial(false);
          },
          ({ errorMessage }) => showNotification('danger', t('error'), errorMessage)
        );
      },
      ({ errorMessage }) => showNotification('danger', t('error'), errorMessage)
    );
    return () => window.api.cleanupFileExists();
  }, [trainer]);

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGridTrainer columns="440px minmax(min-content, 1024px)" gap="24px">
        <TrainerInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {trainerName}
                <span className="data-id">#{padStr(trainer.id, 3)}</span>
              </h1>
            </DataInfoContainerHeaderTitle>
            {trainer.vsType === 2 && <TrainerCategory category="double">{t('vs_type2')}</TrainerCategory>}
          </DataInfoContainerHeader>
          <TrainerSubInfoContainer>
            <DataFieldsetField label={t('trainer_class')} data={getText(TRAINER_CLASS_TEXT_ID, trainer.id)} />
            <DataFieldsetField label={t('ai_level')} data={t(TRAINER_AI_CATEGORIES[trainer.ai - 1])} />
            <DataFieldsetField label={t('money_given')} data={`${getTrainerMoney(trainer)} P$`} />
          </TrainerSubInfoContainer>
        </TrainerInfoContainer>
        {trainer.battlers.length !== 0 && state.projectPath && (
          <TrainerSpriteContainer show={initial ? 'show' : !spriteBig && !spriteDp ? 'not-show' : 'show'}>
            {spriteBig && (
              <div className="sprite-big">
                <ResourceImage imagePathInProject={trainerSpriteBigPath(trainer)} />
              </div>
            )}
            {spriteDp && (
              <div className="sprite-dp">
                <ResourceImage imagePathInProject={trainerSpritePath(trainer)} />
              </div>
            )}
          </TrainerSpriteContainer>
        )}
      </DataGridTrainer>
    </DataBlockContainer>
  );
};
