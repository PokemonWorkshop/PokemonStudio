import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { useProjectMapLinks, useProjectMaps, useProjectZones } from '@hooks/useProjectData';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { createMapLink } from '@utils/entityCreation';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { TooltipWrapper } from '@ds/Tooltip';
import { useZodForm } from '@hooks/useZodForm';
import { useSelectOptions } from '@hooks/useSelectOptions';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { findFirstAvailableId } from '@utils/ModelUtils';
import { mapLinkMapOptions } from '@utils/MapLinkUtils';
import { SelectOption as OldSelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectOption } from '@ds/Select/types';
import { ProjectData } from '@src/GlobalStateProvider';
import { z } from 'zod';
import styled from 'styled-components';
import React, { forwardRef, useMemo } from 'react';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const getMapOptions = (
  defaultMapOptions: OldSelectOption[],
  mapLinks: ProjectData['mapLinks'],
  maps: ProjectData['maps'],
  zones: ProjectData['zones']
): SelectOption<string>[] => {
  const mapOptions = mapLinkMapOptions(defaultMapOptions, maps, zones);
  const mainMapsInMapLink = Object.values(mapLinks).map(({ mapId }) => mapId);
  return mapOptions.filter(({ value }) => !mainMapsInMapLink.includes(Number(value)));
};

type MapLinkNewEditorProps = {
  closeDialog: () => void;
};

const MAP_LINK_NEW_EDITOR_SCHEMA = z.object({ mapId: z.string() }).pick({ mapId: true });

export const MapLinkNewEditor = forwardRef<EditorHandlingClose, MapLinkNewEditorProps>(({ closeDialog }, ref) => {
  const { projectDataValues: mapLinks, setProjectDataValues: setMapLink } = useProjectMapLinks();
  const { projectDataValues: maps } = useProjectMaps();
  const { projectDataValues: zones } = useProjectZones();
  const { t } = useTranslation();
  const defaultMapOptions = useSelectOptions('maps');
  const mapOptions = useMemo(() => getMapOptions(defaultMapOptions, mapLinks, maps, zones), [defaultMapOptions, mapLinks, maps, zones]);
  const mapLink = { mapId: mapOptions[0]?.value || '__undef__' };
  const { getFormData, defaults, formRef } = useZodForm(MAP_LINK_NEW_EDITOR_SCHEMA, mapLink);
  const { Select } = useInputAttrsWithLabel(MAP_LINK_NEW_EDITOR_SCHEMA, defaults);

  useEditorHandlingClose(ref);

  const onClickNew = () => {
    const result = getFormData();
    if (!result.success) return;

    const id = findFirstAvailableId(mapLinks, 0);
    const newMapLink = createMapLink(id, Number(result.data.mapId));
    const dbSymbol = newMapLink.dbSymbol;

    setMapLink({ [dbSymbol]: newMapLink }, { mapLink: dbSymbol });
    closeDialog();
  };

  return (
    <Editor type="creation" title={t('new_maplink')}>
      <InputFormContainer ref={formRef}>
        <Select name="mapId" label={t('map')} options={mapOptions} />
        <ButtonContainer>
          <TooltipWrapper>
            <PrimaryButton onClick={onClickNew} disabled={mapOptions.length === 0}>
              {t('add_the_maplink')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={closeDialog}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputFormContainer>
    </Editor>
  );
});
MapLinkNewEditor.displayName = 'MapLinkNewEditor';
