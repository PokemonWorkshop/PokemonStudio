import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectGroup } from '@components/selects';
import { TagWithSelection } from '@components/Tag';

import { useZonePage } from '@src/hooks/usePage';

import { StudioGroup } from '@modelEntities/group';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { padStr } from '@utils/PadStr';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateZone } from './useUpdateZone';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';
import { defineRelationCustomCondition } from '@utils/GroupUtils';

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
  currentGroupIndex: number;
};

export const ZoneEditGroupEditor = forwardRef<EditorHandlingClose, ZoneEditGroupEditorProps>(({ currentGroupIndex }, ref) => {
  const { zone, groups } = useZonePage();
  const updateZone = useUpdateZone(zone);
  const [group, setGroup] = useState<StudioGroup>(cloneEntity(groups[zone.wildGroups[currentGroupIndex]]));
  const updateGroup = useUpdateGroup(group);
  const [wildGroups, setWildGroups] = useState(cloneEntity(zone.wildGroups));
  const { t } = useTranslation(['database_zones', 'database_groups']);

  const onChangeGroup = (dbSymbol: string) => {
    setGroup(cloneEntity(groups[dbSymbol]));
    const wildGroupsEdited = cloneEntity(wildGroups);
    wildGroupsEdited[currentGroupIndex] = dbSymbol as DbSymbol;
    setWildGroups(wildGroupsEdited);
  };

  const onClickTag = (mapId: number) => {
    const mapIdIndex = mapIdIndexInGroup(mapId, group);
    const customConditions = cloneEntity(group.customConditions);
    if (mapIdIndex === -1) {
      customConditions.push({ type: 'mapId', relationWithPreviousCondition: 'OR', value: mapId });
    } else {
      customConditions.splice(mapIdIndex, 1);
    }
    setGroup({ ...group, customConditions });
  };

  const onClose = () => {
    const customConditions = cloneEntity(group.customConditions);
    updateZone({
      wildGroups: wildGroups,
    });
    updateGroup({ customConditions: defineRelationCustomCondition(customConditions) });
  };

  useEditorHandlingClose(ref, onClose);

  return (
    <Editor type="creation" title={t('database_groups:groups')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="groups">{t('database_groups:group')}</Label>
          <SelectGroup
            dbSymbol={group.dbSymbol}
            onChange={(dbSymbol) => onChangeGroup(dbSymbol)}
            filter={(dbSymbol) => !rejectedGroup(wildGroups, group).includes(dbSymbol as DbSymbol)}
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
                  <TagWithSelection key={mapIdIndex} onClick={() => onClickTag(id)} selected={mapIdIndexInGroup(id, group) !== -1}>
                    <span className="map-id">{padStr(id, 2)}</span>
                  </TagWithSelection>
                ))}
            </MapsListContainer>
          </InputWithTopLabelContainer>
        )}
      </InputContainer>
    </Editor>
  );
});
ZoneEditGroupEditor.displayName = 'ZoneEditGroupEditor';
