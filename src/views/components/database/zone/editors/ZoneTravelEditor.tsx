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
  const { t } = useTranslation();
  const { zone } = useZonePage();
  const updateZone = useUpdateZone(zone);

  const [isWarpDisallowed, setIsWarpDisallowed] = useState<boolean>(zone.isWarpDisallowed);
  const [isFlyAllowed, setIsFlyAllowed] = useState<boolean>(zone.isFlyAllowed);
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
    let result = true;
    if (!isWarpDisallowed) {
      result &&= !!positionXRef.current && !!positionYRef.current && positionXRef.current.validity.valid && positionYRef.current.validity.valid;
    }
    if (isFlyAllowed) {
      result &&= !!warpXRef.current && !!warpYRef.current && warpXRef.current.validity.valid && warpYRef.current.validity.valid;
    }
    return result;
  };

  const onClose = () => {
    if (!canClose()) return;

    const warpX = !warpXRef.current ? null : isNaN(warpXRef.current.valueAsNumber) ? null : warpXRef.current.valueAsNumber;
    const warpY = !warpYRef.current ? null : isNaN(warpYRef.current.valueAsNumber) ? null : warpYRef.current.valueAsNumber;
    const posX = !positionXRef.current ? null : isNaN(positionXRef.current.valueAsNumber) ? null : positionXRef.current.valueAsNumber;
    const posY = !positionYRef.current ? null : isNaN(positionYRef.current.valueAsNumber) ? null : positionYRef.current.valueAsNumber;

    updateZone({
      warp: { x: warpX, y: warpY },
      position: { x: posX, y: posY },
      isWarpDisallowed,
      isFlyAllowed,
    });
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('travel')}>
      <InputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="warp">{t('warp')}</Label>
          <Toggle name="warp" checked={!isWarpDisallowed} onChange={(event) => onChangeWarp(!event.target.checked)} />
        </InputWithLeftLabelContainer>
        {isWarpDisallowed && !isFlyAllowed ? (
          <></>
        ) : (
          <OutsideContainer>
            {!isWarpDisallowed && (
              <InputWithLeftLabelContainer>
                <Label htmlFor="outside-zone">{t('outdoor_zone')}</Label>
                <Toggle name="outside-zone" checked={isFlyAllowed} onChange={(event) => setIsFlyAllowed(event.target.checked)} />
              </InputWithLeftLabelContainer>
            )}

            {isFlyAllowed && (
              <InputWithCoordinateLabelContainer>
                <Label htmlFor="landing-coordinates">{t('landing_coordinates')}</Label>
                <div className="coordinates">
                  <CoordinateInput type="number" unit="x" min="0" max="99999" defaultValue={zone.warp.x?.toString()} ref={warpXRef} />
                  <CoordinateInput type="number" unit="y" min="0" max="99999" defaultValue={zone.warp.y?.toString()} ref={warpYRef} />
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
