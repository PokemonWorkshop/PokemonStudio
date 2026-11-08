import { TrainerCategory } from '@components/categories';
import { ResourceImage } from '@components/ResourceImage';
import { CONTROL, useKeyPress } from '@hooks/useKeyPress';
import { useProjectTrainerClasses } from '@hooks/useProjectData';
import { useShortcutNavigation } from '@hooks/useShortcutNavigation';
import { getTrainerMoney, StudioTrainer, TRAINER_AI_CATEGORIES } from '@modelEntities/trainer';
import { padStr } from '@utils/PadStr';
import { trainerResourcePath } from '@utils/path';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  DataBlockContainer,
  DataFieldsetField,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
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
  const { t } = useTranslation();
  const getTrainerName = useGetEntityNameText();
  const { projectDataValues: trainerClasses } = useProjectTrainerClasses();
  const trainerClass = trainerClasses[trainer.classSymbol];
  const trainerClassName = trainerClass ? getTrainerName(trainerClasses[trainer.classSymbol]) : t('trainer_class_deleted');
  const trainerName = getTrainerName(trainer);
  const trainerFullName = `${trainerClassName} ${trainerName}`;
  const aiLevelName = trainer.ai > TRAINER_AI_CATEGORIES.length ? 'custom' : TRAINER_AI_CATEGORIES[trainer.ai - 1].label;

  const isClickable: boolean = useKeyPress(CONTROL);
  const shortcutTrainerClassNavigation = useShortcutNavigation('trainerClasses', 'trainerClass', '/database/trainerClasses/');

  return (
    <DataBlockContainer size="full" onClick={() => dialogsRef.current?.openDialog('frame')}>
      <DataGridTrainer columns="440px minmax(min-content, 1024px)" gap="24px">
        <TrainerInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {trainerClass ? trainerFullName : trainerName}
                <span className="data-id">#{padStr(trainer.id, 3)}</span>
              </h1>
            </DataInfoContainerHeaderTitle>
            {trainer.vsType === 2 && <TrainerCategory category="double">{t('vs_type2')}</TrainerCategory>}
            {trainer.vsType === 3 && <TrainerCategory category="triple">{t('vs_type3')}</TrainerCategory>}
          </DataInfoContainerHeader>
          <TrainerSubInfoContainer>
            <DataFieldsetField
              label={t('trainer_class')}
              data={trainerClassName}
              error={!trainerClass}
              clickable={{ isClickable: isClickable && !!trainerClass, callback: () => shortcutTrainerClassNavigation(trainer.classSymbol) }}
            />
            <DataFieldsetField label={t('ai_level')} data={t(aiLevelName)} />
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
