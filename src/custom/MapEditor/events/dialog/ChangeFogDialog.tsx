import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Dim, FooterBtn, Row, Scrim, SmallInput, SmallSelect } from './styles';
import { PicturePicker } from './PicturePicker';
import { FogPreview } from './FogPreview';
import { clamp, type CmdForm } from './commandModel';

/**
 * Fork-owned. A spacious pop-out for the Change Fog (204) command — like the
 * Move Route / Common Events windows — so the fog preview gets a full-size map
 * instead of being crammed into the inline command form. Controls on the left,
 * a large live preview on the right.
 *
 * It edits the shared `CmdForm` in place via `setForm`; the parent commits with
 * the same `submitForm` path every other command uses (buildCommandsFromForm
 * already handles `changeFog`), so there's no bespoke serialisation here.
 */

const Dialog = styled.div`
  width: 900px;
  height: min(680px, calc(100vh - 48px));
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  border-radius: 10px;
  overflow: hidden;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};

  & input,
  & select {
    box-sizing: border-box;
  }
`;

const TitleBar = styled.div`
  padding: 8px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  ${({ theme }) => theme.fonts.normalMedium};
`;

const Body = styled.div`
  display: flex;
  gap: 14px;
  padding: 12px 14px;
  min-height: 0;
  flex: 1;
`;

const Controls = styled.div`
  width: 320px;
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
`;

const PreviewPane = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

type Props = {
  form: CmdForm;
  // The raw cmdForm dispatch (state is CmdForm | null) so the drag handler can
  // accumulate offset deltas functionally without losing intermediate moves.
  setForm: React.Dispatch<React.SetStateAction<CmdForm | null>>;
  fogFiles: string[];
  getMapSnapshot?: () => string | null;
  onSubmit: () => void;
  onCancel: () => void;
};

export const ChangeFogDialog = ({ form, setForm, fogFiles, getMapSnapshot, onSubmit, onCancel }: Props) => {
  const { t } = useTranslation();
  // Capture the map snapshot once when the dialog opens (same as the inline
  // tone/fog previews) — the underlying canvas doesn't change while it's up.
  const [mapSnapshot] = useState<string | null>(() => getMapSnapshot?.() ?? null);

  return (
    <Scrim onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <Dialog onMouseDown={(e) => e.stopPropagation()}>
        <TitleBar>{t('me_events_cmd_changeFog')}</TitleBar>
        <Body>
          <Controls>
            <Dim>{t('me_events_fog_graphic')}</Dim>
            <PicturePicker
              folder="fogs"
              files={fogFiles}
              value={form.fogName === '__undef__' ? '' : form.fogName}
              onChange={(fogName) => setForm({ ...form, fogName: fogName || '__undef__' })}
            />
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_opacity')}</Dim>
              <input type="range" min={0} max={255} value={form.fogOpacity} style={{ flex: 1, minWidth: 0 }} onChange={(e) => setForm({ ...form, fogOpacity: Number(e.target.value) })} />
              <SmallInput type="number" min={0} max={255} value={form.fogOpacity} onChange={(e) => setForm({ ...form, fogOpacity: clamp(Number(e.target.value) || 0, 0, 255) })} />
            </Row>
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_hue')}</Dim>
              <input type="range" min={0} max={360} value={form.fogHue} style={{ flex: 1, minWidth: 0 }} onChange={(e) => setForm({ ...form, fogHue: Number(e.target.value) })} />
              <SmallInput type="number" min={0} max={360} value={form.fogHue} onChange={(e) => setForm({ ...form, fogHue: clamp(Number(e.target.value) || 0, 0, 360) })} />
            </Row>
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_blend')}</Dim>
              <SmallSelect value={form.fogBlend} onChange={(e) => setForm({ ...form, fogBlend: Number(e.target.value) })}>
                <option value={0}>{t('me_events_fog_blend_normal')}</option>
                <option value={1}>{t('me_events_fog_blend_add')}</option>
                <option value={2}>{t('me_events_fog_blend_sub')}</option>
                <option value={3}>{t('me_events_fog_blend_mult')}</option>
              </SmallSelect>
            </Row>
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_zoom')}</Dim>
              <SmallInput type="number" min={1} value={form.fogZoom} onChange={(e) => setForm({ ...form, fogZoom: Math.max(1, Number(e.target.value) || 100) })} />
              <Dim>%</Dim>
            </Row>
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_scroll')}</Dim>
              <Dim>{t('me_events_fog_sx')}</Dim>
              <SmallInput type="number" value={form.fogSx} onChange={(e) => setForm({ ...form, fogSx: Number(e.target.value) || 0 })} />
              <Dim>{t('me_events_fog_sy')}</Dim>
              <SmallInput type="number" value={form.fogSy} onChange={(e) => setForm({ ...form, fogSy: Number(e.target.value) || 0 })} />
            </Row>
            <Row>
              <Dim style={{ minWidth: 52 }}>{t('me_events_fog_offset')}</Dim>
              <Dim>{t('me_events_fog_ox')}</Dim>
              <SmallInput type="number" value={form.fogOx} onChange={(e) => setForm({ ...form, fogOx: Math.round(Number(e.target.value) || 0) })} />
              <Dim>{t('me_events_fog_oy')}</Dim>
              <SmallInput type="number" value={form.fogOy} onChange={(e) => setForm({ ...form, fogOy: Math.round(Number(e.target.value) || 0) })} />
            </Row>
            <Dim $wrap style={{ fontStyle: 'italic' }}>{t('me_events_fog_offset_hint')}</Dim>
          </Controls>
          <PreviewPane>
            <FogPreview
              snapshotUrl={mapSnapshot}
              fogName={form.fogName}
              hue={form.fogHue}
              opacity={form.fogOpacity}
              blend={form.fogBlend}
              zoom={form.fogZoom}
              sx={form.fogSx}
              sy={form.fogSy}
              ox={form.fogOx}
              oy={form.fogOy}
              height={520}
              onOffsetChange={(dOx, dOy) =>
                setForm((prev) => (prev ? { ...prev, fogOx: Math.round(prev.fogOx + dOx), fogOy: Math.round(prev.fogOy + dOy) } : prev))
              }
            />
          </PreviewPane>
        </Body>
        <Footer>
          <FooterBtn onClick={onCancel}>{t('me_events_cancel')}</FooterBtn>
          <FooterBtn $primary onClick={onSubmit}>{t('me_events_ok')}</FooterBtn>
        </Footer>
      </Dialog>
    </Scrim>
  );
};
