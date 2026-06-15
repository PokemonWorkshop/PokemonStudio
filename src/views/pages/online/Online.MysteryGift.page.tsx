import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PageEditor, PageTemplate } from '@components/pages';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { MysteryGiftEditorOverlay, type MysteryGiftEditorKeys } from '@components/online/mysteryGift/MysteryGiftEditorOverlay';
import { getSessionGifts, removeSessionGift, type SessionGift } from '@utils/onlineSessionGifts';
import { isOnlineAdminConfigured } from '@utils/onlineConfig';

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

const GiftCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 8px;

  .main {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6};
  }

  .meta {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
  }
`;

const GiftList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text400};
  ${({ theme }) => theme.fonts.normalSmall};

  &:hover {
    color: ${({ theme }) => theme.colors.dangerBase};
  }
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

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export const OnlineMysteryGiftPage = () => {
  const { t } = useTranslation();
  const dialogsRef = useDialogsRef<MysteryGiftEditorKeys>();
  const [gifts, setGifts] = useState<SessionGift[]>(() => getSessionGifts());
  const [adminReady, setAdminReady] = useState<boolean>(() => isOnlineAdminConfigured());

  useEffect(() => {
    // Refresh on focus in case the user just configured the admin key in another tab/window.
    const onFocus = () => setAdminReady(isOnlineAdminConfigured());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const refreshGifts = () => setGifts(getSessionGifts());

  const handleCreateClick = () => {
    if (!isOnlineAdminConfigured()) {
      setAdminReady(false);
      return;
    }
    setAdminReady(true);
    dialogsRef.current?.openDialog('create');
  };

  const handleRemove = (giftId: string) => setGifts(removeSessionGift(giftId));

  return (
    <PageTemplate title={t('online_mystery_gift')} size="default">
      {!adminReady && (
        <InfoBanner>
          <strong>{t('online_admin_not_configured')}</strong>
          <span>{t('online_admin_not_configured_hint')}</span>
        </InfoBanner>
      )}

      <PageEditor
        title={t('online_recently_created_gifts')}
        editorTitle={t('online_mystery_gift')}
        add={{ label: t('online_create_gift'), onClick: handleCreateClick }}
      >
        {gifts.length === 0 ? (
          <EmptyState>{t('online_no_gifts_yet')}</EmptyState>
        ) : (
          <GiftList>
            {gifts.map((g) => (
              <GiftCard key={g.giftId}>
                <div className="main">
                  <span className="title">{g.title}</span>
                  <span className="meta">
                    <code>{g.giftId}</code>
                    {' · '}
                    {g.type === 'code' ? `${t('online_gift_type')}: code (${g.code})` : t('online_gift_type_internet')}
                    {' · '}
                    {formatDate(g.createdAt)}
                  </span>
                  <span className="meta">{g.baseUrl}</span>
                </div>
                <RemoveButton onClick={() => handleRemove(g.giftId)}>{t('online_remove_from_list')}</RemoveButton>
              </GiftCard>
            ))}
          </GiftList>
        )}
        <ApiHint>{t('online_no_admin_list_endpoint')}</ApiHint>
      </PageEditor>

      <MysteryGiftEditorOverlay ref={dialogsRef} onCreated={refreshGifts} />
    </PageTemplate>
  );
};
