import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PageEditor, PageTemplate } from '@components/pages';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { MysteryGiftEditorOverlay, type MysteryGiftEditorKeys } from '@components/online/mysteryGift/MysteryGiftEditorOverlay';
import { isOnlineAdminConfigured } from '@utils/onlineConfig';
import { deleteMysteryGift, enableMysteryGift, listAllMysteryGifts } from '@utils/onlineApi';
import { DarkButton } from '@components/buttons';
import { showNotification } from '@utils/showNotification';
import { GiftDetailsView, type GiftDetailed } from '@components/online/mysteryGift/GiftDetailsView';
import { DeleteGiftOverlay, type DeleteGiftKeys } from '@components/online/mysteryGift/DeleteGiftOverlay';
import { isDisableGiftWarningDismissed } from '@components/online/mysteryGift/DeleteGiftConfirmation';

const InfoBanner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.warningSoft};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalMedium};
`;

const GiftList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DangerButton = styled.button`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.dangerBase};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalMedium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EditButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryBase};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalMedium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SuccessButton = styled.button`
  background-color: ${({ theme }) => theme.colors.successSoft};
  color: ${({ theme }) => theme.colors.successBase};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalMedium};

  &:hover {
    background-color: ${({ theme }) => theme.colors.successHover};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const EmptyState = styled.span`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.text400};
`;

const ApiHint = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  display: block;
  margin-top: 8px;
`;

const ErrorText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
`;

type GiftListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; gifts: GiftDetailed[] }
  | { status: 'error'; message: string };

const parseServerError = (result: { body: unknown; error?: string; status: number }): string => {
  const body = result.body as { error?: string; message?: string } | string | null;
  if (body && typeof body === 'object') return body.error ?? body.message ?? result.error ?? `HTTP ${result.status}`;
  if (typeof body === 'string' && body.length > 0) return body;
  return result.error ?? `HTTP ${result.status}`;
};

export const OnlineMysteryGiftPage = () => {
  const { t } = useTranslation();
  const dialogsRef = useDialogsRef<MysteryGiftEditorKeys>();
  const deleteDialogsRef = useDialogsRef<DeleteGiftKeys>();

  const [adminReady, setAdminReady] = useState<boolean>(() => isOnlineAdminConfigured());
  const [listState, setListState] = useState<GiftListState>({ status: 'idle' });
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GiftDetailed | null>(null);
  // The gift currently being edited (handed to MysteryGiftEditorOverlay as a prop).
  // null = create mode when the editor opens.
  const [editingGift, setEditingGift] = useState<GiftDetailed | null>(null);

  const fetchGifts = useCallback(async () => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setAdminReady(true);
    setListState({ status: 'loading' });
    try {
      const result = await listAllMysteryGifts();
      if (!result.ok) {
        // Distinguish "this server is too old" from generic errors: 404 with the
        // server's literal "Route not found" payload means the admin list
        // endpoint isn't deployed yet, even though we're hitting the right path.
        // Surface a clearer message so the user doesn't think their request is
        // malformed or that the list is empty.
        const rawMsg = parseServerError(result);
        const endpointMissing = result.status === 404 && /route not found/i.test(rawMsg);
        setListState({ status: 'error', message: endpointMissing ? t('online_gifts_endpoint_missing') : rawMsg });
        return;
      }
      const body = result.body;
      const gifts: GiftDetailed[] = Array.isArray(body) ? (body as GiftDetailed[]) : [];
      setListState({ status: 'ok', gifts });
    } catch (e) {
      setListState({ status: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  }, [t]);

  // Auto-fetch on mount when admin is configured. Re-fetch when the window
  // regains focus in case the user configured the admin key in another window.
  useEffect(() => {
    if (isOnlineAdminConfigured()) {
      void fetchGifts();
    }
    const onFocus = () => {
      const ready = isOnlineAdminConfigured();
      setAdminReady(ready);
      if (ready) void fetchGifts();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchGifts]);

  const { activeGifts, disabledGifts } = useMemo(() => {
    if (listState.status !== 'ok') return { activeGifts: [] as GiftDetailed[], disabledGifts: [] as GiftDetailed[] };
    const active: GiftDetailed[] = [];
    const disabled: GiftDetailed[] = [];
    for (const g of listState.gifts) {
      // The admin endpoint returns `isActive: true | false`; treat undefined as active for safety.
      (g.isActive === false ? disabled : active).push(g);
    }
    return { activeGifts: active, disabledGifts: disabled };
  }, [listState]);

  const handleCreateClick = () => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setAdminReady(true);
    setEditingGift(null);
    dialogsRef.current?.openDialog('create');
  };

  const handleEditClick = (gift: GiftDetailed) => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setEditingGift(gift);
    dialogsRef.current?.openDialog('edit');
  };

  const handleDelete = (gift: GiftDetailed) => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setPendingDelete(gift);
    // If the admin has previously ticked "Don't show this warning again",
    // skip the confirmation modal and go straight to the server call. State
    // is set first so `performDelete` (which reads `pendingDelete`) finds the
    // gift on its next render.
    if (isDisableGiftWarningDismissed()) {
      // performDelete reads from state, which won't be flushed synchronously.
      // Defer to the next microtask so the state update has applied.
      queueMicrotask(() => void performDeleteFor(gift));
      return;
    }
    deleteDialogsRef.current?.openDialog('confirm', true);
  };

  // Shared implementation. The dialog flow goes through `performDelete` (which
  // reads `pendingDelete`); the skip-warning flow goes directly through
  // `performDeleteFor(gift)`. Both end up here.
  const performDeleteFor = async (gift: GiftDetailed) => {
    setMutatingId(gift.giftId);
    try {
      const result = await deleteMysteryGift(gift.giftId);
      const treatAsGone = result.ok || result.status === 404;
      if (treatAsGone) {
        // Optimistic local flip — the server now considers it disabled. A
        // background refetch keeps us honest against any other concurrent
        // edits (e.g. another admin changed something).
        setListState((prev) =>
          prev.status === 'ok'
            ? { status: 'ok', gifts: prev.gifts.map((g) => (g.giftId === gift.giftId ? { ...g, isActive: false } : g)) }
            : prev,
        );
        showNotification('success', t('online_mystery_gift'), t('online_gift_deleted'));
        void fetchGifts();
      } else {
        showNotification('danger', t('online_mystery_gift'), parseServerError(result));
      }
    } catch (e) {
      showNotification('danger', t('online_mystery_gift'), e instanceof Error ? e.message : String(e));
    } finally {
      setMutatingId(null);
      setPendingDelete(null);
    }
  };

  const performDelete = async () => {
    if (!pendingDelete) return;
    await performDeleteFor(pendingDelete);
  };

  const handleEnable = async (gift: GiftDetailed) => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setMutatingId(gift.giftId);
    try {
      const result = await enableMysteryGift(gift.giftId);
      if (result.ok) {
        setListState((prev) =>
          prev.status === 'ok'
            ? { status: 'ok', gifts: prev.gifts.map((g) => (g.giftId === gift.giftId ? { ...g, isActive: true } : g)) }
            : prev,
        );
        showNotification('success', t('online_mystery_gift'), t('online_gift_enabled'));
        void fetchGifts();
      } else {
        showNotification('danger', t('online_mystery_gift'), parseServerError(result));
      }
    } catch (e) {
      showNotification('danger', t('online_mystery_gift'), e instanceof Error ? e.message : String(e));
    } finally {
      setMutatingId(null);
    }
  };

  const isLoading = listState.status === 'loading';
  const hasError = listState.status === 'error';

  return (
    <PageTemplate title={t('online_mystery_gift')} size="default">
      {!adminReady && (
        <InfoBanner>
          <strong>{t('online_admin_not_configured')}</strong>
          <span>{t('online_admin_not_configured_hint')}</span>
        </InfoBanner>
      )}

      <PageEditor
        title={t('online_active_gifts')}
        editorTitle={t('online_mystery_gift')}
        add={{ label: t('online_create_gift'), onClick: handleCreateClick }}
      >
        <Toolbar>
          <DarkButton onClick={fetchGifts} disabled={isLoading || !adminReady}>
            {isLoading ? t('online_gifts_loading') : t('online_gifts_refresh')}
          </DarkButton>
        </Toolbar>
        {hasError && <ErrorText>{t('online_gifts_error', { error: (listState as { message: string }).message })}</ErrorText>}
        {listState.status === 'ok' && activeGifts.length === 0 && <EmptyState>{t('online_active_gifts_empty')}</EmptyState>}
        {listState.status === 'ok' && activeGifts.length > 0 && (
          <GiftList>
            {activeGifts.map((g) => (
              <GiftDetailsView
                key={g.giftId}
                gift={g}
                actions={
                  <>
                    <EditButton onClick={() => handleEditClick(g)} disabled={mutatingId === g.giftId}>
                      {t('online_gift_edit')}
                    </EditButton>
                    <DangerButton onClick={() => handleDelete(g)} disabled={mutatingId === g.giftId}>
                      {mutatingId === g.giftId ? t('online_gift_deleting') : t('online_gift_delete')}
                    </DangerButton>
                  </>
                }
              />
            ))}
          </GiftList>
        )}
        <ApiHint>{t('online_active_gifts_hint')}</ApiHint>
      </PageEditor>

      {listState.status === 'ok' && disabledGifts.length > 0 && (
        <PageEditor title={t('online_disabled_gifts')} editorTitle={t('online_mystery_gift')}>
          <GiftList>
            {disabledGifts.map((g) => (
              <GiftDetailsView
                key={g.giftId}
                gift={g}
                actions={
                  <>
                    <EditButton onClick={() => handleEditClick(g)} disabled={mutatingId === g.giftId}>
                      {t('online_gift_edit')}
                    </EditButton>
                    <SuccessButton onClick={() => handleEnable(g)} disabled={mutatingId === g.giftId}>
                      {mutatingId === g.giftId ? t('online_gift_enabling') : t('online_gift_enable')}
                    </SuccessButton>
                  </>
                }
              />
            ))}
          </GiftList>
          <ApiHint>{t('online_disabled_gifts_hint')}</ApiHint>
        </PageEditor>
      )}

      <MysteryGiftEditorOverlay ref={dialogsRef} onCreated={fetchGifts} editingGift={editingGift ?? undefined} />
      <DeleteGiftOverlay ref={deleteDialogsRef} title={pendingDelete?.title ?? ''} onConfirm={performDelete} />
    </PageTemplate>
  );
};
