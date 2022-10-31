import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockContainer, DataFieldsetField, DataGrid, DataInfoContainer, DataInfoContainerHeaderTitle } from '../dataBlocks';
import GroupModel, { GroupVariationsMap } from '@modelEntities/group/Group.model';
import { getActivationLabel, getVariationValue } from '@utils/GroupUtils';
import styled from 'styled-components';
import { padStr } from '@utils/PadStr';
import { DataFieldsetFieldWithChild } from '../dataBlocks/DataFieldsetField';

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

const EnvironmentContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalRegular}

  & span:nth-child(2) {
    color: ${({ theme }) => theme.colors.text400};
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    flex-direction: column;
    gap: 0px;
  }
`;

export const GroupFrame = ({ group, onClick }: GroupFrameProps) => {
  const { t } = useTranslation('database_groups');
  const variationText = GroupVariationsMap.find((variation) => variation.value === getVariationValue(group))?.label;

  return (
    <DataBlockContainer size="full" onClick={onClick}>
      <DataGrid columns="minmax(min-content, 1024px)">
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
            <DataFieldsetFieldWithChild label={t('environment')}>
              <EnvironmentContainer>
                <span>{t(group.systemTag)}</span>
                <span>{`(${variationText ? t(variationText) : '???'})`}</span>
              </EnvironmentContainer>
            </DataFieldsetFieldWithChild>
          </GroupSubInfoContainer>
        </GroupInfoContainer>
      </DataGrid>
    </DataBlockContainer>
  );
};
