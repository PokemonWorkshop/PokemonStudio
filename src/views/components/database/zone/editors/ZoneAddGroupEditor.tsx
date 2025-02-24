import React, { forwardRef, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Editor, useRefreshUI } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectGroup } from '@components/selects';
import { DarkButton, PrimaryButton, SecondaryButton } from '@components/buttons';
import { TagWithSelection } from '@components/Tag';
import { TooltipWrapper } from '@ds/Tooltip';

import { ProjectData } from '@src/GlobalStateProvider';
import { useZonePage } from '@src/hooks/usePage';
import { useProjectGroups, useProjectZones } from '@src/hooks/useProjectData';

import { StudioGroup } from '@modelEntities/group';
import { StudioZone } from '@modelEntities/zone';
import { DbSymbol } from '@modelEntities/dbSymbol';

import { padStr } from '@utils/PadStr';
import { cloneEntity } from '@utils/cloneEntity';
import { defineRelationCustomCondition } from '@utils/GroupUtils';

const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MapsListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 0 0;
  gap: 8px;
`;

const mapIdIndexInGroup = (mapId: number, group: StudioGroup) =>
  group.customConditions.filter((condition) => condition.type === 'mapId').findIndex((condition) => condition.value === mapId);

const setAllTagsMapsOnByDefault = (group: StudioGroup, zone: StudioZone) => {
  zone.maps.forEach((mapId) => {
    const index = mapIdIndexInGroup(mapId, group);
    if (index === -1) group.customConditions.push({ type: 'mapId', relationWithPreviousCondition: 'OR', value: mapId });
  });
};

type ZoneAddGroupEditorProps = {
  closeDialog: () => void;
};

export const ZoneAddGroupEditor = forwardRef<EditorHandlingClose, ZoneAddGroupEditorProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation(['database_zones', 'database_groups', 'database_trainers']);
  const { projectDataValues: groups, setProjectDataValues: setGroup } = useProjectGroups();
  const { setProjectDataValues: setZone } = useProjectZones();
  const { zone } = useZonePage();

  const firstDbSymbol = Object.entries(groups)
    .map(([value, groupData]) => ({ value, index: groupData.id }))
    .filter((data) => !zone.wildGroups.includes(data.value as DbSymbol))
    .sort((a, b) => a.index - b.index)[0].value;

  const [selectedGroup, setSelectedGroup] = useState(firstDbSymbol);
  const group = groups[selectedGroup];
  const currentEditedGroup = useMemo(() => cloneEntity(group), [group]);
  const currentEditedZone = useMemo(() => cloneEntity(zone), [zone]);
  useMemo(() => setAllTagsMapsOnByDefault(currentEditedGroup, zone), [currentEditedGroup, zone]);

  const refreshUI = useRefreshUI();

  const onClickTag = (mapId: number) => {
    const index = mapIdIndexInGroup(mapId, currentEditedGroup);
    if (index === -1) currentEditedGroup.customConditions.push({ type: 'mapId', relationWithPreviousCondition: 'OR', value: mapId });
    else currentEditedGroup.customConditions.splice(index, 1);
  };

  const onAddGroup = (editedGroup: StudioGroup) => {
    currentEditedZone.wildGroups.push(editedGroup.dbSymbol);
    editedGroup.customConditions = defineRelationCustomCondition(editedGroup.customConditions);
    setZone({ [zone.dbSymbol]: currentEditedZone });
    setGroup({ [editedGroup.dbSymbol]: editedGroup });

    closeDialog();
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type="creation" title={t('database_groups:groups')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="groups">{t('database_groups:group')}</Label>
          <GroupContainer>
            <SelectGroup
              dbSymbol={group.dbSymbol}
              onChange={(dbSymbol) => setSelectedGroup(dbSymbol)}
              filter={(dbSymbol) => !zone.wildGroups.includes(dbSymbol as DbSymbol)}
              noLabel
            />
            <TooltipWrapper data-tooltip={t('database_trainers:available_future_release')}>
              <SecondaryButton disabled>{t('database_zones:create_new_group')}</SecondaryButton>
            </TooltipWrapper>
          </GroupContainer>
        </InputWithTopLabelContainer>
        {zone.maps.length !== 0 && (
          <InputWithTopLabelContainer>
            <Label htmlFor="present-on-maps">{t('database_zones:present_on_maps')}</Label>
            <MapsListContainer>
              {zone.maps
                .sort((a, b) => a - b)
                .map((id, index) => (
                  <TagWithSelection key={index} onClick={() => refreshUI(onClickTag(id))} selected={mapIdIndexInGroup(id, currentEditedGroup) !== -1}>
                    <span className="map-id">{padStr(id, 2)}</span>
                  </TagWithSelection>
                ))}
            </MapsListContainer>
          </InputWithTopLabelContainer>
        )}
        <ButtonContainer>
          <PrimaryButton onClick={() => onAddGroup(currentEditedGroup)}>{t('database_zones:add_this_group')}</PrimaryButton>
          <DarkButton onClick={closeDialog}>{t('database_zones:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});
