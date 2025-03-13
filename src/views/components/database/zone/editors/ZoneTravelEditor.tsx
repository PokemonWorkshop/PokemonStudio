import React, { forwardRef, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { CoordinateInput, InputContainer, InputWithLeftLabelContainer, InputWithCoordinateLabelContainer, Label, Toggle } from '@components/inputs';

import { useZonePage } from '@src/hooks/usePage';
import { useUpdateZone } from './useUpdateZone';

const OutsideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ZoneTravelEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_zones');
  const { zone } = useZonePage();
  const updateZone = useUpdateZone(zone);

  const [isWarpDisallowed, setIsWarpDisallowed] = useState<boolean>(false);
  const [isFlyAllowed, setIsFlyAllowed] = useState<boolean>(false);
  const positionXRef = useRef<HTMLInputElement>(null);
  const positionYRef = useRef<HTMLInputElement>(null);
  const warpXRef = useRef<HTMLInputElement>(null);
  const warpYRef = useRef<HTMLInputElement>(null);

  const onChangeWarp = (checked: boolean) => {
    setIsWarpDisallowed(checked);
    if (!checked) return;

    setIsFlyAllowed(false);
  };

  const canClose = () => {
    const result =
      !!warpXRef?.current?.validity.valid &&
      !warpYRef?.current?.validity.valid &&
      !positionXRef?.current?.validity.valid &&
      !positionYRef?.current?.validity.valid;

    return result;
  };

  const onClose = () => {
    if (!warpXRef?.current || !warpYRef?.current || !positionXRef?.current || !positionYRef?.current || !canClose()) return;

    updateZone({
      warp: isWarpDisallowed ? { x: null, y: null } : { x: warpXRef.current.valueAsNumber, y: warpYRef.current.valueAsNumber },
      position: { x: positionXRef.current.valueAsNumber, y: positionYRef.current.valueAsNumber },
      isWarpDisallowed: isWarpDisallowed,
      isFlyAllowed: isFlyAllowed,
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('travel')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="warp">{t('warp')}</Label>
          <Toggle name="warp" checked={!zone.isWarpDisallowed} onChange={(event) => onChangeWarp(!event.target.checked)} />
        </InputWithLeftLabelContainer>
        {isWarpDisallowed && !isFlyAllowed ? (
          <></>
        ) : (
          <OutsideContainer>
            {!isWarpDisallowed && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="outside-zone">{t('outdoor_zone')}</Label>
                <Toggle name="outside-zone" checked={zone.isFlyAllowed} onChange={(event) => setIsFlyAllowed(event.target.checked)} />
              </InputWithLeftLabelContainer>
            )}

            {isFlyAllowed && (
              <InputWithCoordinateLabelContainer>
                <Label htmlFor="landing-coordinates">{t('landing_coordinates')}</Label>
                <div className="coordinates">
                  <CoordinateInput type="number" unit="x" min="0" max="99999" defaultValue={zone.warp.x?.toString()} ref={warpXRef} />
                  <CoordinateInput type="number" unit="y" min="0" max="99999" defaultValue={zone.warp.x?.toString()} ref={warpYRef} />
                </div>
              </InputWithCoordinateLabelContainer>
            )}
          </OutsideContainer>
        )}
        <InputWithCoordinateLabelContainer>
          <Label htmlFor="position-worldmap">{t('worldmap_coordinates')}</Label>
          <div className="coordinates">
            <CoordinateInput type="number" unit="x" min="0" max="99999" defaultValue={zone.position.x?.toString()} ref={positionXRef} />
            <CoordinateInput type="number" unit="y" min="0" max="99999" defaultValue={zone.position.y?.toString()} ref={positionYRef} />
          </div>
        </InputWithCoordinateLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ZoneTravelEditor.displayName = 'ZoneTravelEditor';
