import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Editor, useRefreshUI } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectGroup } from '@components/selects';
import { TagWithSelection } from '@components/Tag';

import { useZonePage } from '@src/hooks/usePage';

import { StudioGroup } from '@modelEntities/group';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { padStr } from '@utils/PadStr';
import { cloneEntity } from '@utils/cloneEntity';

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

export const ZoneEditGroupEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { zone } = useZonePage();

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

  const canClose = () => {
    const result = true;

    return result;
  };

  const onClose = () => {
    if (!canClose()) return;
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="creation" title={t('database_groups:groups')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="groups">{t('database_groups:group')}</Label>
          <SelectGroup
            dbSymbol={group.data.dbSymbol}
            onChange={(dbSymbol) => refreshUI(onChangeGroup(dbSymbol))}
            filter={(dbSymbol) => !rejectedGroup(zone.wildGroups, group.data).includes(dbSymbol as DbSymbol)}
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
});
