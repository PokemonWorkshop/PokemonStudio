import React from 'react';
import { useTranslation } from 'react-i18next';
import QuestModel from '@modelEntities/quest/Quest.model';
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

type QuestFrameProps = {
  quest: QuestModel;
  onClick: () => void;
};

export const QuestFrame = ({ quest, onClick }: QuestFrameProps) => {
  const { t } = useTranslation('database_quests');

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
        <DataInfoContainer>
          <DataInfoContainerHeader>
            <DataInfoContainerHeaderTitle>
              <h1>
                {quest.name()}
                <span className="data-id">#{padStr(quest.id, 3)}</span>
              </h1>
            </DataInfoContainerHeaderTitle>
            <DataInfoContainerHeaderBadges>
              <QuestCategory category={quest.isPrimary ? 'primary' : 'secondary'}>{quest.isPrimary ? t('primary') : t('secondary')}</QuestCategory>
              {/* <QuestCategory category={quest.resolution}>{t(quest.resolution)}</QuestCategory> */}
            </DataInfoContainerHeaderBadges>
          </DataInfoContainerHeader>
          <p>{quest.descr()}</p>
        </DataInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
