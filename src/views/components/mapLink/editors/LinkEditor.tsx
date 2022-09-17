import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';

import { TFunction, useTranslation } from 'react-i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectRMXPMap } from '@components/selects';
import MapLinkModel, { Cardinal, CardinalCategory, getLinksFromMapLink } from '@modelEntities/maplinks/MapLink.model';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const OffsetInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const getShift = (cardinal: Cardinal, t: TFunction<'database_maplinks'>) => {
  if (cardinal === 'north' || cardinal === 'south') return t('offset_shift_right');

  return t('offset_downward_shift');
};

const mapsAlreadyAssigned = (mapLink: MapLinkModel, cardinal: Cardinal, index: number) => {
  const currentLink = getLinksFromMapLink(mapLink, cardinal)[index];
  return CardinalCategory.reduce(
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
  mapLink: MapLinkModel;
  cardinal: Cardinal;
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
          <SelectRMXPMap
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
              min="-99999"
              max="99999"
              value={isNaN(link.offset) ? '' : link.offset}
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < -99999 || newValue > 99999) return event.preventDefault();
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
