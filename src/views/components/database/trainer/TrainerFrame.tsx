import React from 'react';
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
import { padStr } from '@utils/PadStr';
import { TrainerCategory } from '@components/categories';
import { useGetEntityNameText, useGetProjectText } from '@utils/ReadingProjectText';
import { getTrainerMoney, StudioTrainer, TRAINER_AI_CATEGORIES, TRAINER_CLASS_TEXT_ID } from '@modelEntities/trainer';
import { trainerResourcePath } from '@utils/path';
import { ResourceImage } from '@components/ResourceImage';
import { TrainerDialogsRef } from './editors/TrainerEditorOverlay';

type TrainerFrameProps = {
  trainer: StudioTrainer;
  dialogsRef: TrainerDialogsRef;
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

const TrainerSpriteContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: right;
  height: 160px;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    justify-content: left;
  }

  & .sprite {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background-color: ${({ theme }) => theme.colors.dark15};
    border-radius: 4px;
  }

  & .artwork-full {
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

export const TrainerFrame = ({ trainer, dialogsRef }: TrainerFrameProps) => {
  const { t } = useTranslation('database_trainers');
  const getTrainerName = useGetEntityNameText();
  const getText = useGetProjectText();
  const trainerClass = getText(TRAINER_CLASS_TEXT_ID, trainer.id);
  const trainerName = `${trainerClass} ${getTrainerName(trainer)}`;

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
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
            <DataFieldsetField label={t('trainer_class')} data={trainerClass} />
            <DataFieldsetField label={t('ai_level')} data={t(TRAINER_AI_CATEGORIES[trainer.ai - 1])} />
            <DataFieldsetField label={t('money_given')} data={`${getTrainerMoney(trainer)} P$`} />
          </TrainerSubInfoContainer>
        </TrainerInfoContainer>

        <TrainerSpriteContainer>
          {trainer.resources.artworkFull && (
            <div className="artwork-full">
              <ResourceImage imagePathInProject={trainerResourcePath(trainer, 'artworkFull')} />
            </div>
          )}
          {trainer.resources.sprite && (
            <div className="sprite">
              <ResourceImage imagePathInProject={trainerResourcePath(trainer, 'sprite')} />
            </div>
          )}
        </TrainerSpriteContainer>
      </DataGridTrainer>
    </DataBlockContainer>
  );
};
