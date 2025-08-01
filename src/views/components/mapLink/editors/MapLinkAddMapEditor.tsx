import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { useProjectMapLinks, useProjectMaps, useProjectZones } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';
import { useZodForm } from '@hooks/useZodForm';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { SelectOption as OldSelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectOption } from '@ds/Select/types';
import { ProjectData } from '@src/GlobalStateProvider';
import { mapLinkMapOptions } from '@utils/MapLinkUtils';
import { z } from 'zod';
import styled from 'styled-components';
import React, { forwardRef, useMemo } from 'react';
import {
  getLinksFromMapLink,
  MAP_LINK_CARDINAL_LIST,
  MAP_LINK_CARDINAL_VALIDATOR,
  StudioMapLink,
  StudioMapLinkCardinal,
} from '@modelEntities/mapLink';
import { TFunction } from 'i18next';
import { useUpdateMapLink } from './useUpdateMapLink';
import { useMapLinkPage } from '@src/hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const getMapOptions = (
  defaultMapOptions: OldSelectOption[],
  mapLink: StudioMapLink,
  mapLinks: ProjectData['mapLinks'],
  maps: ProjectData['maps'],
  zones: ProjectData['zones']
): SelectOption<string>[] => {
  const mapOptions = mapLinkMapOptions(defaultMapOptions, mapLinks, maps, zones);
  const mapAlreadyAssigned = MAP_LINK_CARDINAL_LIST.flatMap((cardinal) => getLinksFromMapLink(mapLink, cardinal).map((link) => link.mapId)).concat(
    mapLink.mapId
  );
  return mapOptions.filter(({ value }) => !mapAlreadyAssigned.includes(Number(value)));
};

const getCardinalOptions = (t: TFunction): SelectOption<string>[] =>
  MAP_LINK_CARDINAL_LIST.map((cardinal) => ({ value: cardinal, label: t(`cardinal_${cardinal}`) }));

type MapLinkAddMapEditorProps = {
  closeDialog: () => void;
};

const MAP_LINK_ADD_MAP_EDITOR_SCHEMA = z.object({ mapId: z.string(), cardinal: MAP_LINK_CARDINAL_VALIDATOR }).pick({ mapId: true, cardinal: true });

export const MapLinkAddMapEditor = forwardRef<EditorHandlingClose, MapLinkAddMapEditorProps>(({ closeDialog }, ref) => {
  const { mapLink } = useMapLinkPage();
  const { projectDataValues: mapLinks, setProjectDataValues: setMapLink } = useProjectMapLinks();
  const { projectDataValues: maps } = useProjectMaps();
  const { projectDataValues: zones } = useProjectZones();
  const updateMapLink = useUpdateMapLink(mapLink);
  const { t } = useTranslation();
  const defaultMapOptions = useSelectOptions('maps');
  const mapOptions = useMemo(
    () => getMapOptions(defaultMapOptions, mapLink, mapLinks, maps, zones),
    [defaultMapOptions, mapLink, mapLinks, maps, zones]
  );
  const cardinalOptions = getCardinalOptions(t);
  const mapLinkForm = { mapId: mapOptions[0]?.value || '__undef__', cardinal: 'north' as StudioMapLinkCardinal };
  const { getFormData, defaults, formRef } = useZodForm(MAP_LINK_ADD_MAP_EDITOR_SCHEMA, mapLinkForm);
  const { Select } = useInputAttrsWithLabel(MAP_LINK_ADD_MAP_EDITOR_SCHEMA, defaults);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const result = getFormData();
    if (!result.success) return;

    const { mapId, cardinal } = result.data;
    const links = cloneEntity(mapLink[`${cardinal}Maps`]);
    links.push({ mapId: Number(mapId), offset: 0 });
    updateMapLink({ [`${cardinal}Maps`]: links });

    // TODO: reverse link

    closeDialog();
  };

  return (
    <Editor type="edit" title={t('add_a_map')}>
      <InputFormContainer ref={formRef}>
        <Select name="mapId" label={t('map')} options={mapOptions} />
        <Select name="cardinal" label={t('cardinal')} options={cardinalOptions} />
        <ButtonContainer>
          <TooltipWrapper>
            <PrimaryButton onClick={onClickNew} disabled={mapOptions.length === 0}>
              {t('add_the_map')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
MapLinkAddMapEditor.displayName = 'MapLinkAddMapEditor';
