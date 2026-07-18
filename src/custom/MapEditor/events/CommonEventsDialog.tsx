import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useCommonEvents } from './useCommonEvents';
import { CommandListEditor } from './CommandListEditor';
import { NamePicker } from './dialog/fields';
import type { WorkingCommand } from './rmxpEventUtils';
import {
  Body,
  Dialog,
  DIALOG_BODY_ATTR,
  Dim,
  FieldCol,
  FieldLabel,
  Footer,
  FooterBtn,
  IconBtn,
  LeftColumn,
  NameInput,
  OpBtn,
  RightColumn,
  Row,
  Scrim,
  SmallSelect,
  TitleBar,
} from './dialog/styles';

/**
 * Fork-only Common Event editor — opened from the "Edit common events…" button
 * on the Call Common Event command. A left list (create/rename/delete) and a
 * right pane with the selected event's name, trigger, switch, and the shared
 * command-list editor. Saves to Data/CommonEvents.rxdata via useCommonEvents.
 */

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const ListRow = styled.button<{ $active: boolean }>`
  all: unset;
  /* all: unset resets display to inline — restore block so padding/height and
     the ellipsis truncation actually apply (otherwise the text gets clipped). */
  display: block;
  box-sizing: border-box;
  width: 100%;
  /* Critical: a flex item with overflow:hidden gets an automatic min-size of 0,
     so in the column-flex List these rows would shrink to a sliver and clip the
     text vertically. Pin their height and let the List scroll instead. */
  flex: none;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalRegular};
  line-height: 1.4;
  color: ${({ theme, $active }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background: ${({ theme, $active }) => ($active ? theme.colors.dark23 : 'transparent')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover { background: ${({ theme, $active }) => ($active ? theme.colors.dark23 : theme.colors.dark18)}; }
`;

const TRIGGERS = ['none', 'autorun', 'parallel'] as const;

export const CommonEventsDialog = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const [{ projectPath }] = useGlobalState();
  const { commonEvents, dirty, skipped, save, updateEvent, setList, createEvent, deleteEvent } = useCommonEvents(projectPath);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [systemNames, setSystemNames] = useState<{ switches: string[]; variables: string[] }>({ switches: [], variables: [] });
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectPath) return;
    window.api.readRMXPSwitchNames(
      { projectPath },
      (o) => setSystemNames({ switches: o.switches ?? [], variables: o.variables ?? [] }),
      () => setSystemNames({ switches: [], variables: [] }),
    );
  }, [projectPath]);

  // Keep a valid selection as the list loads / an event is deleted.
  useEffect(() => {
    if (commonEvents.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (selectedId === null || !commonEvents.some((c) => c.id === selectedId)) setSelectedId(commonEvents[0].id);
  }, [commonEvents, selectedId]);

  const selected = useMemo(() => commonEvents.find((c) => c.id === selectedId) ?? null, [commonEvents, selectedId]);

  const doSave = async () => {
    const err = await save();
    setSaveError(err);
  };

  return (
    <Scrim onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Dialog style={{ width: 'min(1000px, 94vw)' }}>
        <TitleBar>
          <span>{t('me_events_common_events_title')}</span>
          <span style={{ flex: 1 }} />
          <IconBtn onClick={onClose} title={t('me_events_cancel')}>✕</IconBtn>
        </TitleBar>

        <Body {...{ [DIALOG_BODY_ATTR]: '' }}>
          <LeftColumn style={{ width: 260 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <FieldLabel>{t('me_events_common_events_title')}</FieldLabel>
              <OpBtn onClick={() => setSelectedId(createEvent())}>＋ {t('me_events_common_event_new')}</OpBtn>
            </Row>
            <List>
              {commonEvents.length === 0 && <Dim style={{ padding: 8 }}>{t('me_events_common_event_empty')}</Dim>}
              {commonEvents.map((ce) => (
                <ListRow key={ce.id} $active={ce.id === selectedId} onClick={() => setSelectedId(ce.id)} title={`[${ce.id}] ${ce.name}`}>
                  [{ce.id}] {ce.name || t('me_events_common_event_unnamed')}
                </ListRow>
              ))}
            </List>
          </LeftColumn>

          <RightColumn>
            {selected ? (
              <>
                <Row>
                  <FieldCol style={{ flex: 1 }}>
                    <FieldLabel>{t('me_events_common_event_name')}</FieldLabel>
                    <NameInput value={selected.name} onChange={(e) => updateEvent(selected.id, { name: e.target.value })} />
                  </FieldCol>
                </Row>
                <Row>
                  <Dim>{t('me_events_common_event_trigger')}</Dim>
                  <SmallSelect value={selected.trigger} onChange={(e) => updateEvent(selected.id, { trigger: Number(e.target.value) })}>
                    {TRIGGERS.map((key, i) => (
                      <option key={key} value={i}>{t(`me_events_common_event_trigger_${key}`)}</option>
                    ))}
                  </SmallSelect>
                  {/* Autorun/parallel are gated by a switch; None ignores it. */}
                  {selected.trigger !== 0 && (
                    <>
                      <Dim>{t('me_events_common_event_switch')}</Dim>
                      <NamePicker names={systemNames.switches} value={selected.switchId} onChange={(v) => updateEvent(selected.id, { switchId: v })} />
                    </>
                  )}
                </Row>
                <CommandListEditor
                  key={selected.id}
                  list={selected.list as WorkingCommand[]}
                  setList={(list) => setList(selected.id, list as typeof selected.list)}
                  systemNames={systemNames}
                  mapEvents={[]}
                  subjectName={selected.name || `[${selected.id}]`}
                />
              </>
            ) : (
              <Dim style={{ margin: 'auto' }}>{t('me_events_common_event_none')}</Dim>
            )}
          </RightColumn>
        </Body>

        <Footer>
          {selected && (
            <OpBtn $danger onClick={() => deleteEvent(selected.id)}>{t('me_events_delete_event')}</OpBtn>
          )}
          {skipped > 0 && <Dim style={{ color: '#e2a33a' }}>{t('me_events_skipped', { count: skipped })}</Dim>}
          {saveError && <Dim style={{ color: '#e2565a' }}>{saveError}</Dim>}
          <span style={{ flex: 1 }} />
          <FooterBtn $primary onClick={doSave} disabled={!dirty}>{t('me_events_apply')}</FooterBtn>
          <FooterBtn onClick={onClose}>{t('me_events_cancel')}</FooterBtn>
        </Footer>
      </Dialog>
    </Scrim>
  );
};
