import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ResourceImage } from '@components/ResourceImage';
import { useProjectItems } from '@hooks/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { itemIconPath } from '@utils/path';

import type { GiftCreature, GiftEgg, GiftItem } from '@utils/onlineApi';
import { GiftCreatureCard } from './GiftCreatureCard';

/**
 * Normalized shape both list sources (server fetch + session cache) can map to.
 * Built loosely on `CreateGiftBody` so missing fields are simply rendered as
 * absent — the renderer never invents defaults the server didn't return.
 */
export type GiftDetailed = {
  giftId: string;
  title: string;
  type?: 'internet' | 'code';
  code?: string;
  rarity?: number;
  items?: GiftItem[];
  creatures?: GiftCreature[];
  eggs?: GiftEgg[];
  allowedClaimers?: string[];
  maxClaims?: number;
  alwaysAvailable?: boolean;
  validFrom?: string;
  validTo?: string;
  /** Local-only metadata, used by the Recently-Created list. */
  createdAt?: string;
  baseUrl?: string;
  /** When false, render a "Disabled" badge in the header (soft-deleted server-side). */
  isActive?: boolean;
  disabledAt?: string;
};

const Card = styled.div<{ $dimmed?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 8px;
  ${({ $dimmed }) => $dimmed && 'opacity: 0.6;'}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.span`
  ${({ theme }) => theme.fonts.titlesHeadline6};
`;

const MetaRow = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  word-break: break-word;
`;

const ActionsColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Badge = styled.span<{ tone?: 'default' | 'accent' | 'shiny' | 'code' }>`
  ${({ theme }) => theme.fonts.normalSmall};
  padding: 2px 8px;
  border-radius: 999px;
  background-color: ${({ theme, tone }) =>
    tone === 'accent'
      ? theme.colors.primarySoft
      : tone === 'shiny'
      ? theme.colors.warningSoft
      : tone === 'code'
      ? theme.colors.infoSoft
      : theme.colors.dark22};
  color: ${({ theme, tone }) =>
    tone === 'accent'
      ? theme.colors.primaryBase
      : tone === 'shiny'
      ? theme.colors.warningBase
      : tone === 'code'
      ? theme.colors.infoBase
      : theme.colors.text400};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.span`
  ${({ theme }) => theme.fonts.titlesOverline};
  color: ${({ theme }) => theme.colors.text400};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const formatDate = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

// Items resolve against project data so the gift list reads like the bag editor —
// icon + localized name, with a sensible fallback when the item dbSymbol was
// renamed/deleted after the gift was created.
const ItemRowVisual = ({ it, index }: { it: GiftItem; index: number }) => {
  const { t } = useTranslation();
  const { projectDataValues: items } = useProjectItems();
  const getEntityName = useGetEntityNameText();
  const symbol = typeof it.id === 'string' ? it.id : '';
  const item = symbol ? items[symbol] : undefined;

  return (
    <ItemEntry>
      {item ? <ResourceImage imagePathInProject={itemIconPath(item.icon)} /> : <div className="placeholder">?</div>}
      <div className="info">
        <span className="name">{item ? getEntityName(item) : symbol || t('online_gift_items')}</span>
        <span className="meta">#{index + 1}</span>
      </div>
      <span className="count">× {it.count}</span>
    </ItemEntry>
  );
};

const ItemEntry = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 6px;

  & img {
    max-width: 32px;
    max-height: 32px;
  }

  & div.placeholder {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background-color: ${({ theme }) => theme.colors.dark20};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text400};
  }

  & div.info {
    display: flex;
    flex-direction: column;

    .name {
      color: ${({ theme }) => theme.colors.text100};
      ${({ theme }) => theme.fonts.normalMedium};
    }
    .meta {
      ${({ theme }) => theme.fonts.normalSmall};
      color: ${({ theme }) => theme.colors.text400};
    }
  }

  & span.count {
    ${({ theme }) => theme.fonts.normalMedium};
    color: ${({ theme }) => theme.colors.text100};
  }
`;

type Props = {
  gift: GiftDetailed;
  actions?: React.ReactNode;
};

export const GiftDetailsView = ({ gift, actions }: Props) => {
  const { t } = useTranslation();

  const availability = gift.alwaysAvailable
    ? t('online_server_gifts_always_available')
    : gift.validFrom && gift.validTo
    ? t('online_server_gifts_valid_range', { from: formatDate(gift.validFrom), to: formatDate(gift.validTo) })
    : undefined;

  const items = gift.items ?? [];
  const creatures = gift.creatures ?? [];
  const eggs = gift.eggs ?? [];
  const isDisabled = gift.isActive === false;

  return (
    <Card $dimmed={isDisabled}>
      <Header>
        <TitleColumn>
          <Title>{gift.title}</Title>
          <MetaRow>
            <code>{gift.giftId}</code>
            {gift.createdAt && <> {' · '} {formatDate(gift.createdAt)}</>}
            {gift.baseUrl && <> {' · '} {gift.baseUrl}</>}
          </MetaRow>
          <BadgeRow>
            {isDisabled && <Badge tone="shiny">{t('online_gift_disabled_badge')}</Badge>}
            {gift.type === 'internet' && <Badge tone="accent">{t('online_gift_type_internet')}</Badge>}
            {gift.type === 'code' && (
              <Badge tone="code">
                {t('online_gift_type_code')}
                {gift.code ? `: ${gift.code}` : ''}
              </Badge>
            )}
            {gift.rarity !== undefined && <Badge>{t('online_gift_rarity')}: {gift.rarity}</Badge>}
            {availability && <Badge>{availability}</Badge>}
            {gift.maxClaims !== undefined && (
              <Badge>
                {t('online_gift_field_max_claims')}:{' '}
                {gift.maxClaims === -1 ? t('online_gift_field_unlimited') : gift.maxClaims}
              </Badge>
            )}
            {gift.allowedClaimers && gift.allowedClaimers.length > 0 && (
              <Badge>
                {t('online_gift_field_allowed_claimers')}: {gift.allowedClaimers.length}
              </Badge>
            )}
          </BadgeRow>
        </TitleColumn>
        {actions && <ActionsColumn>{actions}</ActionsColumn>}
      </Header>

      {items.length > 0 && (
        <Section>
          <SectionTitle>{t('online_gift_items')}</SectionTitle>
          {items.map((it, idx) => (
            <ItemRowVisual key={idx} it={it} index={idx} />
          ))}
        </Section>
      )}

      {creatures.length > 0 && (
        <Section>
          <SectionTitle>{t('online_gift_creatures')}</SectionTitle>
          {creatures.map((c, idx) => (
            <GiftCreatureCard key={idx} c={c} index={idx} />
          ))}
        </Section>
      )}

      {eggs.length > 0 && (
        <Section>
          <SectionTitle>{t('online_gift_eggs')}</SectionTitle>
          {eggs.map((e, idx) => (
            <GiftCreatureCard key={idx} c={e} index={idx} asEgg />
          ))}
        </Section>
      )}
    </Card>
  );
};
