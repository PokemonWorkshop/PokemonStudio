import React, { useState } from 'react';
import styled from 'styled-components';
import { Editor } from '@components/editor';

import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { SelectMaplink } from '@components/selects';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { getLinksFromMapLink, MAP_LINK_CARDINAL_LIST, StudioMapLink, StudioMapLinkCardinal } from '@modelEntities/mapLink';
import { TooltipWrapper } from '@ds/Tooltip';

const OffsetInfo = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const getShift = (cardinal: StudioMapLinkCardinal, t: TFunction) => {
  if (cardinal === 'north' || cardinal === 'south') return t('offset_shift_right');

  return t('offset_downward_shift');
};

const mapsAlreadyAssigned = (mapLink: StudioMapLink) => {
  return MAP_LINK_CARDINAL_LIST.flatMap((cardinal) => getLinksFromMapLink(mapLink, cardinal).map((link) => link.mapId)).concat(mapLink.mapId);
};

type NewLinkEditorProps = {
  mapLink: StudioMapLink;
  cardinal: StudioMapLinkCardinal;
  onClose: () => void;
  onAddLink: (cardinal: StudioMapLinkCardinal, selectedMap: string, offset: number) => void;
};

export const NewLinkEditor = ({ mapLink, cardinal, onClose, onAddLink }: NewLinkEditorProps) => {
  const { t } = useTranslation();
  const [selectedMap, setSelectedMap] = useState<string>('__undef__');
  const [offset, setOffset] = useState<number>(0);

  return (
    <Editor type="creation" title={t('maplinks')}>
      <InputContainer size="l">
        <InputContainer size="s">
          <InputWithTopLabelContainer>
            <Label htmlFor="map" required>
              {t('map_located', { cardinal: t(`${cardinal}`) })}
            </Label>
            <SelectMaplink
              mapId={selectedMap}
              onChange={(selected) => setSelectedMap(selected.value)}
              noneValue
              noneValueIsError
              excludeMaps={mapsAlreadyAssigned(mapLink)}
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
                value={isNaN(offset) ? '' : offset}
                onChange={(event) => {
                  const newValue = parseInt(event.target.value);
                  if (newValue < -999 || newValue > 999) return event.preventDefault();
                  setOffset(newValue);
                }}
                onBlur={() => setOffset(cleanNaNValue(offset))}
              />
            </InputWithLeftLabelContainer>
            <OffsetInfo>{t('offset_info', { shift: getShift(cardinal, t) })}</OffsetInfo>
          </InputWithTopLabelContainer>
        </InputContainer>
        <ButtonContainer>
          <TooltipWrapper data-tooltip={selectedMap === '__undef__' ? t('fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={() => onAddLink(cardinal, selectedMap, offset)} disabled={selectedMap === '__undef__'}>
              {t('add_link')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
