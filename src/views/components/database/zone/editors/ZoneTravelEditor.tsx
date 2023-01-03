import React from 'react';
import styled from 'styled-components';
import { Editor, useRefreshUI } from '@components/editor';
import { CoordinateInput, InputContainer, InputWithLeftLabelContainer, InputWithCoordinateLabelContainer, Label, Toggle } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { cleaningNaNToNull } from '@utils/cleanNaNValue';
import { StudioZone } from '@modelEntities/zone';

const OutsideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

type ZoneCoordinateInputProps = {
  unit: string;
  value: number | null;
  setValue: (v: number | null) => void;
  refreshUI: (_: unknown) => void;
};

const ZoneCoordinateInput = ({ unit, value, setValue, refreshUI }: ZoneCoordinateInputProps) => {
  return (
    <CoordinateInput
      type="text"
      unit={unit}
      min="0"
      max="99999"
      value={value === null || isNaN(value) ? '' : value}
      onChange={(event) => {
        const val = parseInt(event.target.value);
        if (val < 0 || val > 99_999) return event.preventDefault();
        refreshUI(setValue(val));
      }}
      onBlur={() => refreshUI(setValue(cleaningNaNToNull(value)))}
    />
  );
};

type ZoneTravelEditorProps = {
  zone: StudioZone;
};

export const ZoneTravelEditor = ({ zone }: ZoneTravelEditorProps) => {
  const { t } = useTranslation('database_zones');
  const refreshUI = useRefreshUI();

  const onChangeWarp = (b: boolean) => {
    zone.isWarpDisallowed = b;
    if (!b) return;

    zone.warp = { x: null, y: null };
    zone.isFlyAllowed = false;
  };

  return (
    <Editor type="edit" title={t('travel')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="warp">{t('warp')}</Label>
          <Toggle name="warp" checked={!zone.isWarpDisallowed} onChange={(event) => refreshUI(onChangeWarp(!event.target.checked))} />
        </InputWithLeftLabelContainer>
        {zone.isWarpDisallowed && !zone.isFlyAllowed ? (
          <></>
        ) : (
          <OutsideContainer>
            {!zone.isWarpDisallowed && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="outside-zone">{t('outdoor_zone')}</Label>
                <Toggle name="outside-zone" checked={zone.isFlyAllowed} onChange={(event) => refreshUI((zone.isFlyAllowed = event.target.checked))} />
              </InputWithLeftLabelContainer>
            )}
            {zone.isFlyAllowed && (
              <InputWithCoordinateLabelContainer>
                <Label htmlFor="landing-coordinates">{t('landing_coordinates')}</Label>
                <div className="coordinates">
                  <ZoneCoordinateInput unit="x" value={zone.warp.x} setValue={(value) => (zone.warp.x = value)} refreshUI={refreshUI} />
                  <ZoneCoordinateInput unit="y" value={zone.warp.y} setValue={(value) => (zone.warp.y = value)} refreshUI={refreshUI} />
                </div>
              </InputWithCoordinateLabelContainer>
            )}
          </OutsideContainer>
        )}
        <InputWithCoordinateLabelContainer>
          <Label htmlFor="position-worldmap">{t('worldmap_coordinates')}</Label>
          <div className="coordinates">
            <ZoneCoordinateInput unit="x" value={zone.position.x} setValue={(value) => (zone.position.x = value)} refreshUI={refreshUI} />
            <ZoneCoordinateInput unit="y" value={zone.position.y} setValue={(value) => (zone.position.y = value)} refreshUI={refreshUI} />
          </div>
        </InputWithCoordinateLabelContainer>
      </InputContainer>
    </Editor>
  );
};
