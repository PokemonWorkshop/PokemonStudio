import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useGetItemPocketText, useSetProjectText } from '@utils/ReadingProjectText';
import { SelectCustomSimple } from '@components/SelectCustom';
import { ITEM_POCKET_NAME_TEXT_ID, ITEM_SOCKET_LIST } from '@modelEntities/item';
import { useItemPage } from '@hooks/usePage';
import { DarkButton, DeleteButtonOnlyIcon, EditButtonOnlyIcon, PrimaryButton } from '@components/buttons';

/**
 * Fork-only field used by `ItemGenericDataEditor` for socket selection +
 * custom-socket management. Kept in `src/custom/ItemSocket/` so the upstream
 * editor file only needs a single-line render swap, keeping upstream pulls
 * conflict-free.
 *
 * Responsibilities:
 *   - Render the socket dropdown (canonical 1-6 + custom ≥9 + "+ Add new…")
 *   - Manage custom sockets inline (add / rename / delete with confirm)
 *   - Persist names to CSV file 100015 via `setProjectText`
 *   - Surface "busy" state up to the parent so the editor's `canClose`
 *     check can block close while an inline panel is open
 *
 * The parent owns the selected socket value (so it can persist it on close
 * via `useUpdateItem`) — we only own UI state for the add/edit/delete flows.
 */

const ADD_NEW_SOCKET_SENTINEL = '__add_new_socket__';
const STANDARD_SOCKETS: ReadonlySet<number> = new Set<number>(ITEM_SOCKET_LIST);

/**
 * Sockets 7 and 8 are *internally reserved* by PSDK's `pocketMapping`
 * lookup (see `utils/ReadingProjectText.ts`): canonical socket 5 reads its
 * name from CSV row 8, so a "custom" socket 8 would render the same label
 * as socket 5 and produce the visible "two Medicine entries" bug. Custom
 * additions therefore start at socket 9 (CSV row 9, i.e. line 10 when
 * counting from 1). Anything below that is canonical or reserved and not
 * editable from this UI.
 */
const MIN_CUSTOM_SOCKET_ID = 9;
const isCustomSocket = (id: number): boolean => id >= MIN_CUSTOM_SOCKET_ID;
const isVisibleSocket = (id: number): boolean => STANDARD_SOCKETS.has(id) || id >= MIN_CUSTOM_SOCKET_ID;

// PSDK tombstone marker for a "freed" CSV row. We use this on delete instead
// of writing an empty string: empty cells are ambiguous (could be unset, could
// be intentional), and PSDK's text loader treats `[~N]` as a vacated slot. The
// number is the 1-indexed CSV line — for custom sockets (>=9) the row equals
// the socket id, and line = row + 1, so socket 9 → `[~10]`.
const tombstoneFor = (socketId: number): string => `[~${socketId + 1}]`;
const TOMBSTONE_PATTERN = /^\[~\d+\]$/;
const isTombstone = (text: string): boolean => TOMBSTONE_PATTERN.test(text);

const pocketOptions = (
  items: ReturnType<typeof useItemPage>['items'],
  addedSockets: ReadonlySet<number>,
  getItemPocketText: ReturnType<typeof useGetItemPocketText>,
  addNewLabel: string,
) => {
  const usedSockets = new Set<number>();
  Object.values(items).forEach((it) => usedSockets.add(it.socket));
  ITEM_SOCKET_LIST.forEach((s) => usedSockets.add(s));
  addedSockets.forEach((s) => usedSockets.add(s));

  const realOptions = Array.from(usedSockets)
    .filter(isVisibleSocket)
    .sort((a, b) => a - b)
    .map((id) => ({ id, name: getItemPocketText({ klass: 'Item', socket: id }) }))
    .filter(({ id, name }) => STANDARD_SOCKETS.has(id) || !isTombstone(name))
    .map(({ id, name }) => ({ value: id.toString(), label: `(${id}) ${name}` }));

  return [...realOptions, { value: ADD_NEW_SOCKET_SENTINEL, label: addNewLabel }];
};

const nextAvailableSocketId = (
  items: ReturnType<typeof useItemPage>['items'],
  addedSockets: ReadonlySet<number>,
  getItemPocketText: ReturnType<typeof useGetItemPocketText>,
): number => {
  const used = new Set<number>();
  Object.values(items).forEach((it) => used.add(it.socket));
  addedSockets.forEach((s) => used.add(s));
  let candidate = MIN_CUSTOM_SOCKET_ID;
  while (used.has(candidate) && !isTombstone(getItemPocketText({ klass: 'Item', socket: candidate }))) {
    candidate += 1;
  }
  return candidate;
};

const AddSocketPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
`;

const PanelActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const HelpText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const WarningText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.warningBase};
`;

const ManageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
`;

const ManageRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

const ManageName = styled.span`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text100};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ManageActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const ConfirmRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px;
  margin: -2px 0 6px;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-left: 3px solid ${({ theme }) => theme.colors.dangerBase};
  border-radius: 0 6px 6px 0;
`;

const SectionLabel = styled.span`
  ${({ theme }) => theme.fonts.titlesOverline};
  color: ${({ theme }) => theme.colors.text400};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

type EditMode = 'add' | { kind: 'edit'; id: number };

type ItemSocketFieldProps = {
  /** Current socket id as a string (matches SelectCustomSimple's contract). */
  value: string;
  /** Called with the new socket id when the user picks one. */
  onChange: (value: string) => void;
  /**
   * Reports whether the field has an inline panel open (add/edit) or a
   * pending delete confirm. The parent editor uses this to block its
   * `canClose` so we don't lose pending state on a navigation.
   */
  onBusyChange?: (busy: boolean) => void;
};

export const ItemSocketField = ({ value, onChange, onBusyChange }: ItemSocketFieldProps) => {
  const { currentItem, items } = useItemPage();
  const { t } = useTranslation();
  const getItemPocketText = useGetItemPocketText();
  const setProjectText = useSetProjectText();

  // Sockets added/edited this session that may not yet appear in `items`.
  // Kept locally so the dropdown reflects the change immediately.
  const [addedSockets, setAddedSockets] = useState<ReadonlySet<number>>(new Set());
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [panelId, setPanelId] = useState<string>('');
  const [panelName, setPanelName] = useState<string>('');
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const busy = editMode !== null || pendingDelete !== null;
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const options = useMemo(
    () => pocketOptions(items, addedSockets, getItemPocketText, t('item_socket_add_new')),
    [items, addedSockets, t, getItemPocketText],
  );

  const itemCountBySocket = useMemo(() => {
    const counts = new Map<number, number>();
    Object.values(items).forEach((it) => {
      if (it.dbSymbol === currentItem.dbSymbol) return;
      counts.set(it.socket, (counts.get(it.socket) ?? 0) + 1);
    });
    return counts;
  }, [items, currentItem.dbSymbol]);

  const customSockets = useMemo(() => {
    const usedSockets = new Set<number>();
    Object.values(items).forEach((it) => usedSockets.add(it.socket));
    addedSockets.forEach((s) => usedSockets.add(s));
    return Array.from(usedSockets)
      .filter(isCustomSocket)
      .filter((id) => !isTombstone(getItemPocketText({ klass: 'Item', socket: id })))
      .sort((a, b) => a - b);
  }, [items, addedSockets, getItemPocketText]);

  const openAddPanel = () => {
    setEditMode('add');
    setPanelId(nextAvailableSocketId(items, addedSockets, getItemPocketText).toString());
    setPanelName('');
  };

  const openEditPanel = (id: number) => {
    setEditMode({ kind: 'edit', id });
    setPanelId(id.toString());
    setPanelName(getItemPocketText({ klass: 'Item', socket: id }));
  };

  const closePanel = () => setEditMode(null);

  const handleSocketChange = (next: string) => {
    if (next === ADD_NEW_SOCKET_SENTINEL) {
      openAddPanel();
      return;
    }
    onChange(next);
  };

  const parsedPanelId = parseInt(panelId, 10);
  const panelIdIsValid =
    !Number.isNaN(parsedPanelId) &&
    (editMode === 'add' ? parsedPanelId >= MIN_CUSTOM_SOCKET_ID : parsedPanelId > 0);
  const trimmedName = panelName.trim();
  const canConfirmPanel = panelIdIsValid && trimmedName.length > 0;
  const idBelowMin =
    editMode === 'add' && !Number.isNaN(parsedPanelId) && parsedPanelId < MIN_CUSTOM_SOCKET_ID;

  const existingSocketIds = useMemo(() => {
    const used = new Set<number>();
    Object.values(items).forEach((it) => used.add(it.socket));
    ITEM_SOCKET_LIST.forEach((s) => used.add(s));
    addedSockets.forEach((s) => used.add(s));
    return used;
  }, [items, addedSockets]);

  const isEditingThisId = editMode !== null && editMode !== 'add' && editMode.kind === 'edit' && editMode.id === parsedPanelId;
  const overwritesExisting = panelIdIsValid && existingSocketIds.has(parsedPanelId) && !isEditingThisId;

  const handlePanelConfirm = () => {
    if (!canConfirmPanel) return;
    setProjectText(ITEM_POCKET_NAME_TEXT_ID, parsedPanelId, trimmedName);
    setAddedSockets((prev) => {
      const next = new Set(prev);
      next.add(parsedPanelId);
      return next;
    });
    if (editMode === 'add') onChange(parsedPanelId.toString());
    closePanel();
  };

  const performDelete = (id: number) => {
    setProjectText(ITEM_POCKET_NAME_TEXT_ID, id, tombstoneFor(id));
    setAddedSockets((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (value === id.toString()) onChange('1');
    if (editMode !== null && editMode !== 'add' && editMode.kind === 'edit' && editMode.id === id) closePanel();
    setPendingDelete(null);
  };

  return (
    <>
      <InputWithTopLabelContainer>
        <Label>{t('item_socket')} </Label>
        <SelectCustomSimple id="select-item-socket" options={options} value={value} onChange={handleSocketChange} noTooltip />
      </InputWithTopLabelContainer>

      {customSockets.length > 0 && (
        <InputWithTopLabelContainer>
          <SectionLabel>{t('item_socket_manage_title')}</SectionLabel>
          <ManageList>
            {customSockets.map((id) => {
              const otherItemsUsing = itemCountBySocket.get(id) ?? 0;
              const currentItemUses = currentItem.socket === id;
              const name = getItemPocketText({ klass: 'Item', socket: id });
              const isPending = pendingDelete === id;
              return (
                <React.Fragment key={id}>
                  <ManageRow>
                    <ManageName>{`(${id}) ${name}`}</ManageName>
                    <ManageActions>
                      <EditButtonOnlyIcon size="s" onClick={() => openEditPanel(id)} />
                      <DeleteButtonOnlyIcon size="s" onClick={() => setPendingDelete(id)} />
                    </ManageActions>
                  </ManageRow>
                  {isPending && (
                    <ConfirmRow>
                      <WarningText>
                        {otherItemsUsing > 0
                          ? t('item_socket_delete_warning_others', { count: otherItemsUsing })
                          : currentItemUses
                          ? t('item_socket_delete_warning_current')
                          : t('item_socket_delete_warning_none')}
                      </WarningText>
                      <PanelActions>
                        <DarkButton onClick={() => setPendingDelete(null)}>{t('item_socket_cancel')}</DarkButton>
                        <PrimaryButton onClick={() => performDelete(id)}>{t('item_socket_delete_confirm')}</PrimaryButton>
                      </PanelActions>
                    </ConfirmRow>
                  )}
                </React.Fragment>
              );
            })}
          </ManageList>
        </InputWithTopLabelContainer>
      )}

      {editMode !== null && (
        <AddSocketPanel>
          <InputWithTopLabelContainer>
            <Label htmlFor="panel-socket-id">{t('item_socket_new_id_label')}</Label>
            <Input
              type="number"
              id="panel-socket-id"
              min={editMode === 'add' ? MIN_CUSTOM_SOCKET_ID : 1}
              value={panelId}
              onChange={(e) => setPanelId(e.target.value)}
              disabled={editMode !== 'add'}
            />
            <HelpText>
              {editMode === 'add'
                ? t('item_socket_new_id_help', { min: MIN_CUSTOM_SOCKET_ID })
                : t('item_socket_edit_id_locked')}
            </HelpText>
            {idBelowMin && <WarningText>{t('item_socket_id_below_min', { min: MIN_CUSTOM_SOCKET_ID })}</WarningText>}
            {overwritesExisting && !idBelowMin && (
              <WarningText>{t('item_socket_id_exists_warning', { id: parsedPanelId })}</WarningText>
            )}
          </InputWithTopLabelContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="panel-socket-name">{t('item_socket_new_name_label')}</Label>
            <Input
              type="text"
              id="panel-socket-name"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder={t('item_socket_new_name_placeholder')}
            />
            <HelpText>{t('item_socket_new_name_help')}</HelpText>
          </InputWithTopLabelContainer>
          <PanelActions>
            <DarkButton onClick={closePanel}>{t('item_socket_cancel')}</DarkButton>
            <PrimaryButton onClick={handlePanelConfirm} disabled={!canConfirmPanel}>
              {editMode === 'add' ? t('item_socket_confirm') : t('item_socket_save')}
            </PrimaryButton>
          </PanelActions>
        </AddSocketPanel>
      )}
    </>
  );
};
