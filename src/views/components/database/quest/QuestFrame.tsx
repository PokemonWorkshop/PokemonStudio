import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataBlockContainer,
  DataGrid,
  DataInfoContainer,
  DataInfoContainerHeader,
  DataInfoContainerHeaderBadges,
  DataInfoContainerHeaderTitle,
} from '../dataBlocks';
import { QuestCategory } from '@components/categories';
import { padStr } from '@utils/PadStr';
import { useGetEntityDescriptionText, useGetEntityNameText } from '@utils/ReadingProjectText';
import { StudioQuest } from '@modelEntities/quest';

type QuestFrameProps = {
  quest: StudioQuest;
  onClick: () => void;
};

export const QuestFrame = ({ quest, onClick }: QuestFrameProps) => {
  const { t } = useTranslation('database_quests');
  const getQuestName = useGetEntityNameText();
  const getQuestDescription = useGetEntityDescriptionText();

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {getQuestName(quest)}
                <span className="data-id">#{padStr(quest.id, 3)}</span>
              </h1>
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <QuestCategory category={quest.isPrimary ? 'primary' : 'secondary'}>{quest.isPrimary ? t('primary') : t('secondary')}</QuestCategory>
              {/* <QuestCategory category={quest.resolution}>{t(quest.resolution)}</QuestCategory> */}
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{getQuestDescription(quest)}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
