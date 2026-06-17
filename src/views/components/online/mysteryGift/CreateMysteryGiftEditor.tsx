import React, { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import {
  Input,
  InputContainer,
  InputWithLeftLabelContainer,
  InputWithTopLabelContainer,
  Label,
  Toggle,
} from '@components/inputs';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { StudioDropDown } from '@components/StudioDropDown';
import { showNotification } from '@utils/showNotification';

import {
  createMysteryGift,
  updateMysteryGift,
  type CreateGiftBody,
  type GiftCreature,
  type GiftEgg,
  type GiftItem,
  type GiftRarity,
  type GiftType,
} from '@utils/onlineApi';
import type { GiftDetailed } from './GiftDetailsView';
import { ItemsModal } from './ItemsModal';
import { CreaturesModal } from './CreaturesModal';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

const HelpText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const ErrorText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
`;

// Options are built inside the component so labels resolve via `t()`. Defining
// them at module scope with raw strings made the dropdown render the i18n keys
// verbatim ("online_gift_type_internet") instead of the translated text.
const buildTypeOptions = (t: (k: string) => string) => [
  { value: 'internet', label: t('online_gift_type_internet') },
  { value: 'code', label: t('online_gift_type_code') },
];

const buildRarityOptions = (t: (k: string) => string) => [
  { value: '0', label: `0 — ${t('online_gift_rarity_common')}` },
  { value: '1', label: `1 — ${t('online_gift_rarity_uncommon')}` },
  { value: '2', label: `2 — ${t('online_gift_rarity_rare')}` },
  { value: '3', label: `3 — ${t('online_gift_rarity_epic')}` },
];

type Props = {
  closeDialog: () => void;
  /** Called after successful create or edit so the page can refetch. */
  onCreated: () => void;
  /** When provided, the form runs in EDIT mode: submit hits PATCH instead of POST. */
  editingGift?: GiftDetailed;
  /**
   * When provided, the form runs in CREATE mode but pre-populated from this
   * source gift. Used by the "Duplicate" action — same content, fresh giftId
   * + cleared code so codes don't collide.
   */
  duplicateFrom?: GiftDetailed;
};

const parsePlayerIds = (raw: string): string[] => raw.split(',').map((s) => s.trim()).filter(Boolean);
const stringifyPlayerIds = (ids?: string[]): string => (ids ?? []).join(', ');

// `<input type="datetime-local">` gives "YYYY-MM-DDTHH:mm"; convert to ISO.
const toIso = (localValue: string): string | undefined => {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

// ISO → "YYYY-MM-DDTHH:mm" for `<input type="datetime-local">`. Truncates seconds.
const fromIso = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const CreateMysteryGiftEditor = forwardRef<EditorHandlingClose, Props>(
  ({ closeDialog, onCreated, editingGift, duplicateFrom }, ref) => {
  const { t } = useTranslation();
  const typeOptions = buildTypeOptions(t);
  const rarityOptions = buildRarityOptions(t);
  const isEdit = !!editingGift;
  // Source data for initial state: edit gift takes precedence, then duplicate
  // template, then nothing (blank create). Duplicate clears the code so the
  // server's uniqueness constraint isn't violated on save.
  const source: GiftDetailed | undefined = editingGift ?? duplicateFrom;

  const [title, setTitle] = useState(duplicateFrom ? `${duplicateFrom.title} (copy)` : source?.title ?? '');
  const [type, setType] = useState<GiftType>(source?.type ?? 'internet');
  const [code, setCode] = useState(duplicateFrom ? '' : source?.code ?? '');
  const [items, setItems] = useState<GiftItem[]>(source?.items ?? []);
  const [creatures, setCreatures] = useState<GiftCreature[]>(source?.creatures ?? []);
  const [eggs, setEggs] = useState<GiftEgg[]>(source?.eggs ?? []);

  const [allowedClaimers, setAllowedClaimers] = useState(stringifyPlayerIds(source?.allowedClaimers));
  const [maxClaimsUnlimited, setMaxClaimsUnlimited] = useState(source?.maxClaims === undefined || source.maxClaims === -1);
  const [maxClaimsValue, setMaxClaimsValue] = useState(
    source?.maxClaims !== undefined && source.maxClaims > 0 ? source.maxClaims : 10,
  );
  const [alwaysAvailable, setAlwaysAvailable] = useState(source?.alwaysAvailable ?? true);
  const [validFrom, setValidFrom] = useState(fromIso(source?.validFrom));
  const [validTo, setValidTo] = useState(fromIso(source?.validTo));
  const [rarity, setRarity] = useState<GiftRarity>(((source?.rarity ?? 0) as GiftRarity));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showCreaturesModal, setShowCreaturesModal] = useState(false);

  // Dirty tracking: flip to true on the first field-change event after the
  // editor mounts. We use a ref (not state) because we only read it in the
  // cancel handler — no need to re-render when it flips.
  const isDirtyRef = useRef(false);
  const markDirty = () => {
    isDirtyRef.current = true;
  };

  // `code` is stored uppercase on the server, matched case-insensitively, and
  // must not contain spaces (player typability). Strip whitespace + uppercase
  // as the user types so what they see in the field is what gets sent.
  const handleCodeChange = (raw: string) => {
    markDirty();
    setCode(raw.replace(/\s+/g, '').toUpperCase());
  };

  const handleCancel = () => {
    if (isDirtyRef.current && !window.confirm(t('online_gift_cancel_confirm'))) return;
    closeDialog();
  };

  const validate = (): string => {
    if (!title.trim()) return t('online_gift_error_title_required');
    if (title.length > 64) return t('online_gift_error_title_long');
    // Server requires a code whenever type is 'code'. Catch client-side so the
    // user doesn't have to read the server's structured error.
    if (type === 'code' && !code.trim()) return t('online_gift_error_code_required');
    // Server requires content on create, but explicitly allows clearing all
    // arrays during a partial edit ("admin may clear out items/creatures/eggs
    // progressively"). Only enforce on create to match.
    if (!isEdit && items.length === 0 && creatures.length === 0 && eggs.length === 0)
      return t('online_gift_error_empty_payload');
    if (!alwaysAvailable) {
      if (!validFrom || !validTo) return t('online_gift_error_date_range');
      if (new Date(validFrom).getTime() >= new Date(validTo).getTime())
        return t('online_gift_error_date_order');
    }
    return '';
  };

  const onSubmit = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError('');

    // Only include keys with real values — some servers reject explicit `null` / `undefined`
    // or treat empty arrays/strings differently from omission. Conservative shape:
    //   - allowedClaimers only when non-empty (server defaults to "open to all" when omitted).
    //   - validFrom/validTo only when alwaysAvailable is false AND both ISO conversions succeed.
    const claimers = parsePlayerIds(allowedClaimers);
    const body: CreateGiftBody = {
      title: title.trim(),
      type,
      ...(type === 'code' ? { code: code.trim().toUpperCase() } : {}),
      ...(items.length > 0 ? { items } : {}),
      ...(creatures.length > 0 ? { creatures } : {}),
      ...(eggs.length > 0 ? { eggs } : {}),
      ...(claimers.length > 0 ? { allowedClaimers: claimers } : {}),
      maxClaims: maxClaimsUnlimited ? -1 : maxClaimsValue,
      alwaysAvailable,
      ...(alwaysAvailable
        ? {}
        : (() => {
            const from = toIso(validFrom);
            const to = toIso(validTo);
            return from && to ? { validFrom: from, validTo: to } : {};
          })()),
      rarity,
    };

    setSubmitting(true);
    // Log the request and response so the user can read exactly what the server received and
    // what it answered. Without this, "Invalid data" alone gives no actionable signal.
    // eslint-disable-next-line no-console
    console.log(`[mystery-gift] ${isEdit ? 'PATCH' : 'POST'} body:`, body);
    try {
      const result = isEdit && editingGift
        ? await updateMysteryGift(editingGift.giftId, body)
        : await createMysteryGift(body);
      // eslint-disable-next-line no-console
      console.log('[mystery-gift] response:', result);
      if (!result.ok) {
        const parsedBody = result.body as { error?: string; details?: unknown; message?: string } | string | null;
        let serverMsg: string | undefined;
        if (parsedBody && typeof parsedBody === 'object') {
          serverMsg = parsedBody.error ?? parsedBody.message;
          if (parsedBody.details) {
            serverMsg = `${serverMsg ?? ''} — ${JSON.stringify(parsedBody.details)}`;
          }
        } else if (typeof parsedBody === 'string' && parsedBody.length > 0) {
          serverMsg = parsedBody;
        }
        setError(serverMsg ?? result.error ?? `HTTP ${result.status} — see DevTools console for full response`);
        return;
      }
      // The admin "list all" endpoint is now the source of truth — `onCreated`
      // triggers a refetch on the page, so we don't need a local session cache.
      showNotification('success', t('online_mystery_gift'), isEdit ? t('online_gift_updated') : t('online_gift_created'));
      onCreated();
      closeDialog();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  useEditorHandlingClose(ref);

  return (
    <Editor type={isEdit ? 'edit' : 'creation'} title={isEdit ? t('online_edit_gift') : t('online_create_gift')}>
      <InputContainer size="m">
        <InputWithTopLabelContainer>
          <Label required>{t('online_gift_title')}</Label>
          <Input
            type="text"
            maxLength={64}
            value={title}
            onChange={(e) => {
              markDirty();
              setTitle(e.target.value);
            }}
            placeholder="Launch Event Gift"
          />
          <HelpText>{title.length} / 64</HelpText>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label required>{t('online_gift_type')}</Label>
          <StudioDropDown
            value={type}
            options={typeOptions}
            onChange={(v) => {
              markDirty();
              setType(v as GiftType);
            }}
          />
        </InputWithTopLabelContainer>

        {type === 'code' && (
          <InputWithTopLabelContainer>
            <Label required>{t('online_gift_code')}</Label>
            <Input
              type="text"
              maxLength={32}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="LAUNCH2024"
            />
            <HelpText>
              {t('online_gift_code_help')} · {code.length} / 32
            </HelpText>
          </InputWithTopLabelContainer>
        )}

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_items')}</Label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <DarkButton onClick={() => setShowItemsModal(true)}>
              {t('online_gift_manage_items')} ({items.length})
            </DarkButton>
            {items.length > 0 && <HelpText>{items.map((i) => `${i.count}x ${i.id}`).join(', ')}</HelpText>}
          </div>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_creatures')} / {t('online_gift_eggs')}</Label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <DarkButton onClick={() => setShowCreaturesModal(true)}>
              {t('online_gift_manage_creatures')} ({creatures.length + eggs.length})
            </DarkButton>
            {(creatures.length > 0 || eggs.length > 0) && (
              <HelpText>
                {[
                  ...creatures.map((c) => `Lv${c.level} ${c.id}`),
                  ...eggs.map((e) => `Egg: ${e.id}`)
                ].join(', ')}
              </HelpText>
            )}
          </div>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_allowed_claimers')}</Label>
          <Input
            type="text"
            value={allowedClaimers}
            onChange={(e) => {
              markDirty();
              setAllowedClaimers(e.target.value);
            }}
            placeholder="uuid1, uuid2"
          />
          <HelpText>{t('online_gift_allowed_claimers_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithLeftLabelContainer>
          <Label>{t('online_gift_max_claims_unlimited')}</Label>
          <Toggle
            checked={maxClaimsUnlimited}
            onChange={(e) => {
              markDirty();
              setMaxClaimsUnlimited(e.target.checked);
            }}
          />
        </InputWithLeftLabelContainer>
        {!maxClaimsUnlimited && (
          <InputWithLeftLabelContainer>
            <Label>{t('online_gift_max_claims')}</Label>
            <Input
              type="number"
              min="1"
              value={maxClaimsValue}
              onChange={(e) => {
                markDirty();
                setMaxClaimsValue(Math.max(1, parseInt(e.target.value) || 1));
              }}
            />
          </InputWithLeftLabelContainer>
        )}

        <InputWithLeftLabelContainer>
          <Label>{t('online_gift_always_available')}</Label>
          <Toggle
            checked={alwaysAvailable}
            onChange={(e) => {
              markDirty();
              setAlwaysAvailable(e.target.checked);
            }}
          />
        </InputWithLeftLabelContainer>
        {!alwaysAvailable && (
          <>
            <InputWithTopLabelContainer>
              <Label required>{t('online_gift_valid_from')}</Label>
              <Input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => {
                  markDirty();
                  setValidFrom(e.target.value);
                }}
              />
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label required>{t('online_gift_valid_to')}</Label>
              <Input
                type="datetime-local"
                value={validTo}
                onChange={(e) => {
                  markDirty();
                  setValidTo(e.target.value);
                }}
              />
            </InputWithTopLabelContainer>
          </>
        )}

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_rarity')}</Label>
          <StudioDropDown
            value={String(rarity)}
            options={rarityOptions}
            onChange={(v) => {
              markDirty();
              setRarity(Number(v) as GiftRarity);
            }}
          />
        </InputWithTopLabelContainer>

        {error && <ErrorText>{error}</ErrorText>}

        <ButtonContainer>
          <PrimaryButton onClick={onSubmit} disabled={submitting}>
            {submitting
              ? isEdit
                ? t('online_gift_saving')
                : t('online_gift_submitting')
              : isEdit
              ? t('online_gift_save')
              : t('online_gift_submit')}
          </PrimaryButton>
          <DarkButton onClick={handleCancel} disabled={submitting}>
            {t('cancel')}
          </DarkButton>
        </ButtonContainer>
      </InputContainer>

      {showItemsModal && (
        <ItemsModal
          initialItems={items}
          onSave={(newItems) => {
            markDirty();
            setItems(newItems);
            setShowItemsModal(false);
          }}
          onCancel={() => setShowItemsModal(false)}
        />
      )}

      {showCreaturesModal && (
        <CreaturesModal
          initialCreatures={creatures}
          initialEggs={eggs}
          onSave={(newCreatures, newEggs) => {
            markDirty();
            setCreatures(newCreatures);
            setEggs(newEggs);
            setShowCreaturesModal(false);
          }}
          onCancel={() => setShowCreaturesModal(false)}
        />
      )}
    </Editor>
  );
});

CreateMysteryGiftEditor.displayName = 'CreateMysteryGiftEditor';
