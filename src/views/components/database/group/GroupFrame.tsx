import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockContainer, DataFieldsetField, DataGrid, DataInfoContainer, DataInfoContainerHeaderTitle } from '../dataBlocks';
import GroupModel from '@modelEntities/group/Group.model';
import { getActivationLabel } from '@utils/GroupUtils';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';

type GroupFrameProps = {
  group: GroupModel;
  onClick: () => void;
};

const GroupInfoContainer = styled(DataInfoContainer)`
  gap: 20px;
`;

const GroupSubInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
`;

export const GroupFrame = ({ group, onClick }: GroupFrameProps) => {
  const { t } = useTranslation('database_groups');

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="440px minmax(min-content, 1024px)">
        <GroupInfoContainer>
          <DataInfoContainerHeaderTitle>
            <h1>
              {group.name()}
              <span className="data-id">#{padStr(group.id, 3)}</span>
            </h1>
          </DataInfoContainerHeaderTitle>
          <GroupSubInfoContainer>
            <DataFieldsetField label={t('activation')} data={t(getActivationLabel(group) as never)} disabled={false} />
            <DataFieldsetField label={t('battle_type')} data={group.isDoubleBattle ? t('double') : t('simple')} disabled={false} />
            <DataFieldsetField label={t('environment')} data={t(group.systemTag)} disabled={false} />
          </GroupSubInfoContainer>
        </GroupInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
