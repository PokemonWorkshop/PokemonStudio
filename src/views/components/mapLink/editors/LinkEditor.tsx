import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { getLinksFromMapLink, MAP_LINK_CARDINAL_LIST, StudioMapLink, StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { SelectMaplink } from '@components/selects';

const OffsetInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const getShift = (cardinal: StudioMapLinkCardinal, t: TFunction<'database_maplinks'>) => {
  if (cardinal === 'north' || cardinal === 'south') return t('offset_shift_right');

  return t('offset_downward_shift');
};

const mapsAlreadyAssigned = (mapLink: StudioMapLink, cardinal: StudioMapLinkCardinal, index: number) => {
  const currentLink = getLinksFromMapLink(mapLink, cardinal)[index];
  return MAP_LINK_CARDINAL_LIST.reduce(
    (previousValue, currentValue) =>
      previousValue.concat(
        getLinksFromMapLink(mapLink, currentValue)
          .filter((link) => link.mapId !== currentLink.mapId)
          .map((link) => link.mapId)
      ),
    [] as number[]
  ).concat(mapLink.mapId);
};

type NewLinkEditorProps = {
  mapLink: StudioMapLink;
  cardinal: StudioMapLinkCardinal;
  index: number;
};

export const LinkEditor = ({ mapLink, cardinal, index }: NewLinkEditorProps) => {
  const { t } = useTranslation('database_maplinks');
  const link = useMemo(() => getLinksFromMapLink(mapLink, cardinal)[index], [cardinal, index, mapLink]);
  const refreshUI = useRefreshUI();

  return (
    <Editor type="edit" title={t('maplinks')}>
      <InputContainer size="s">
        <InputWithTopLabelContainer>
          <Label htmlFor="map" required>
            {t('map_located', { cardinal: t(cardinal) })}
          </Label>
          <SelectMaplink
            mapId={link.mapId.toString()}
            onChange={(selected) => refreshUI((link.mapId = Number(selected.value)))}
            excludeMaps={mapsAlreadyAssigned(mapLink, cardinal, index)}
          />
        </InputWithTopLabelContainer>
        <InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="offset">{t('offset')}</Label>
            <Input
              type="number"
              name="offset"
              min="-999"
              max="999"
              value={isNaN(link.offset) ? '' : link.offset}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < -999 || newValue > 999) return event.preventDefault();
                refreshUI((link.offset = newValue));
              }}
              onBlur={() => refreshUI((link.offset = cleanNaNValue(link.offset)))}
            />
          </InputWithLeftLabelContainer>
          <OffsetInfo>{t('offset_info', { shift: getShift(cardinal, t) })}</OffsetInfo>
        </InputWithTopLabelContainer>
      </InputContainer>
    </Editor>
  );
};
