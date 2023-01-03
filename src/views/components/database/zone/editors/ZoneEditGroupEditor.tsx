import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectGroup } from '@components/selects';
import { ProjectData } from '@src/GlobalStateProvider';
import { TagWithSelection } from '@components/Tag';
import { padStr } from '@utils/PadStr';
import { cloneEntity } from '@utils/cloneEntity';
import { StudioGroup } from '@modelEntities/group';
import { StudioZone } from '@modelEntities/zone';
import { DbSymbol } from '@modelEntities/dbSymbol';

const MapsListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 4px;
`;

const mapIdIndexInGroup = (mapId: number, group: StudioGroup) =>
  group.customConditions.filter((condition) => condition.type === 'mapId').findIndex((condition) => condition.value === mapId);

const rejectedGroup = (wildGroups: string[], group: StudioGroup) => {
  const wildGroupsCopy = Object.assign([], wildGroups);
  const groupIndex = wildGroupsCopy.indexOf(group.dbSymbol);
  if (groupIndex !== -1) wildGroupsCopy.splice(groupIndex, 1);
  return wildGroupsCopy;
};

type ZoneEditGroupEditorProps = {
  zone: StudioZone;
  groups: ProjectData['groups'];
  group: { data: StudioGroup } | undefined;
  index: number;
};

export const ZoneEditGroupEditor = ({ zone, groups, group, index }: ZoneEditGroupEditorProps) => {
  if (!group) throw new Error('group is undefined');

  const { t } = useTranslation(['database_zones', 'database_groups']);
  const refreshUI = useRefreshUI();

  const onChangeGroup = (dbSymbol: string) => {
    group.data = cloneEntity(groups[dbSymbol]);
    zone.wildGroups[index] = dbSymbol as DbSymbol;
  };

  const onClickTag = (mapId: number) => {
    const mapIdIndex = mapIdIndexInGroup(mapId, group.data);
    if (mapIdIndex === -1) group.data.customConditions.push({ type: 'mapId', relationWithPreviousCondition: 'OR', value: mapId });
    else group.data.customConditions.splice(mapIdIndex, 1);
  };

  return (
    <Editor type="creation" title={t('database_groups:groups')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="groups">{t('database_groups:group')}</Label>
          <SelectGroup
            dbSymbol={group.data.dbSymbol}
            onChange={(selected) => refreshUI(onChangeGroup(selected.value))}
            rejected={rejectedGroup(zone.wildGroups, group.data)}
            noLabel
          />
        </InputWithTopLabelContainer>
        {zone.maps.length !== 0 && (
          <InputWithTopLabelContainer>
            <Label htmlFor="present-on-maps">{t('database_zones:present_on_maps')}</Label>
            <MapsListContainer>
              {zone.maps
                .sort((a, b) => a - b)
                .map((id, mapIdIndex) => (
                  <TagWithSelection key={mapIdIndex} onClick={() => refreshUI(onClickTag(id))} selected={mapIdIndexInGroup(id, group.data) !== -1}>
                    <span className="map-id">{padStr(id, 2)}</span>
                  </TagWithSelection>
                ))}
            </MapsListContainer>
          </InputWithTopLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
};
