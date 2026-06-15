import React, { forwardRef, useState } from 'react';
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
  MultiLineInput,
  Toggle,
} from '@components/inputs';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { StudioDropDown } from '@components/StudioDropDown';
import { showNotification } from '@utils/showNotification';

import {
  createMysteryGift,
  type CreateGiftBody,
  type GiftCreature,
  type GiftEgg,
  type GiftItem,
  type GiftRarity,
  type GiftType,
} from '@utils/onlineApi';
import { recordSessionGift } from '@utils/onlineSessionGifts';
import { getOnlineConfig } from '@utils/onlineConfig';

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

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 96px 32px;
  gap: 8px;
  align-items: center;
`;

const RowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ErrorText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
`;

const RARITY_OPTIONS = [
  { value: '0', label: 'common' },
  { value: '1', label: 'uncommon' },
  { value: '2', label: 'rare' },
  { value: '3', label: 'legendary' },
];

const TYPE_OPTIONS = [
  { value: 'internet', label: 'internet' },
  { value: 'code', label: 'code' },
];

type Props = {
  closeDialog: () => void;
  onCreated: () => void;
};

const parseJsonArray = <T,>(raw: string, label: string): T[] | { error: string } => {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return { error: `${label} must be a JSON array.` };
    return parsed as T[];
  } catch (e) {
    return { error: `${label} is not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
  }
};

const parsePlayerIds = (raw: string): string[] => raw.split(',').map((s) => s.trim()).filter(Boolean);

// `<input type="datetime-local">` gives "YYYY-MM-DDTHH:mm"; convert to ISO.
const toIso = (localValue: string): string | undefined => {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

export const CreateMysteryGiftEditor = forwardRef<EditorHandlingClose, Props>(({ closeDialog, onCreated }, ref) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<GiftType>('internet');
  const [code, setCode] = useState('');
  const [items, setItems] = useState<GiftItem[]>([]);
  const [creaturesJson, setCreaturesJson] = useState('');
  const [eggsJson, setEggsJson] = useState('');
  const [allowedClaimers, setAllowedClaimers] = useState('');
  const [maxClaimsUnlimited, setMaxClaimsUnlimited] = useState(true);
  const [maxClaimsValue, setMaxClaimsValue] = useState(10);
  const [alwaysAvailable, setAlwaysAvailable] = useState(true);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [rarity, setRarity] = useState<GiftRarity>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => setItems((prev) => [...prev, { id: '', count: 1 }]);
  const updateItem = (idx: number, patch: Partial<GiftItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): string => {
    if (!title.trim()) return t('online_gift_error_title_required');
    if (title.length > 64) return t('online_gift_error_title_long');
    if (type === 'code' && !code.trim()) return t('online_gift_error_code_required');
    const cleanItems = items.filter((it) => it.id.trim().length > 0);
    if (cleanItems.length === 0 && !creaturesJson.trim() && !eggsJson.trim())
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

    const cleanItems = items.filter((it) => it.id.trim().length > 0).map((it) => ({ id: it.id.trim(), count: it.count }));
    const creatures = parseJsonArray<GiftCreature>(creaturesJson, 'Creatures');
    if (!Array.isArray(creatures)) {
      setError(creatures.error);
      return;
    }
    const eggs = parseJsonArray<GiftEgg>(eggsJson, 'Eggs');
    if (!Array.isArray(eggs)) {
      setError(eggs.error);
      return;
    }

    const body: CreateGiftBody = {
      title: title.trim(),
      type,
      ...(type === 'code' ? { code: code.trim().toUpperCase() } : {}),
      ...(cleanItems.length > 0 ? { items: cleanItems } : {}),
      ...(creatures.length > 0 ? { creatures } : {}),
      ...(eggs.length > 0 ? { eggs } : {}),
      allowedClaimers: parsePlayerIds(allowedClaimers),
      maxClaims: maxClaimsUnlimited ? -1 : maxClaimsValue,
      alwaysAvailable,
      ...(alwaysAvailable ? {} : { validFrom: toIso(validFrom), validTo: toIso(validTo) }),
      rarity,
    };

    setSubmitting(true);
    try {
      const result = await createMysteryGift(body);
      if (!result.ok) {
        const serverMsg = (result.body as { error?: string } | null)?.error;
        setError(serverMsg ?? result.error ?? `HTTP ${result.status}`);
        return;
      }
      const created = (result.body as { gift?: { giftId?: string; title?: string; type?: GiftType; code?: string; rarity?: number } })?.gift;
      const cfg = getOnlineConfig();
      if (created?.giftId) {
        recordSessionGift({
          giftId: created.giftId,
          title: created.title ?? body.title,
          type: created.type ?? body.type,
          code: created.code ?? body.code,
          rarity: created.rarity ?? body.rarity,
          createdAt: new Date().toISOString(),
          baseUrl: cfg.baseUrl,
        });
      }
      showNotification('success', t('online_mystery_gift'), t('online_gift_created'));
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
    <Editor type="creation" title={t('online_create_gift')}>
      <InputContainer size="m">
        <InputWithTopLabelContainer>
          <Label required>{t('online_gift_title')}</Label>
          <Input type="text" maxLength={64} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Launch Event Gift" />
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label required>{t('online_gift_type')}</Label>
          <StudioDropDown value={type} options={TYPE_OPTIONS} onChange={(v) => setType(v as GiftType)} />
        </InputWithTopLabelContainer>

        {type === 'code' && (
          <InputWithTopLabelContainer>
            <Label required>{t('online_gift_code')}</Label>
            <Input
              type="text"
              maxLength={32}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LAUNCH2024"
            />
            <HelpText>{t('online_gift_code_help')}</HelpText>
          </InputWithTopLabelContainer>
        )}

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_items')}</Label>
          <RowList>
            {items.map((it, idx) => (
              <ItemRow key={idx}>
                <Input type="text" placeholder="potion" value={it.id} onChange={(e) => updateItem(idx, { id: e.target.value })} />
                <Input
                  type="number"
                  min="1"
                  value={it.count}
                  onChange={(e) => updateItem(idx, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <DarkButton onClick={() => removeItem(idx)}>×</DarkButton>
              </ItemRow>
            ))}
            <DarkButton onClick={addItem}>{t('online_gift_add_item')}</DarkButton>
          </RowList>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_creatures')}</Label>
          <MultiLineInput
            value={creaturesJson}
            onChange={(e) => setCreaturesJson(e.currentTarget.value)}
            placeholder={'[\n  { "id": "pikachu", "level": 25, "shiny": true }\n]'}
          />
          <HelpText>{t('online_gift_creatures_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_eggs')}</Label>
          <MultiLineInput
            value={eggsJson}
            onChange={(e) => setEggsJson(e.currentTarget.value)}
            placeholder={'[\n  { "id": "togepi" }\n]'}
          />
          <HelpText>{t('online_gift_eggs_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_allowed_claimers')}</Label>
          <Input
            type="text"
            value={allowedClaimers}
            onChange={(e) => setAllowedClaimers(e.target.value)}
            placeholder="uuid1, uuid2"
          />
          <HelpText>{t('online_gift_allowed_claimers_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithLeftLabelContainer>
          <Label>{t('online_gift_max_claims_unlimited')}</Label>
          <Toggle checked={maxClaimsUnlimited} onChange={(e) => setMaxClaimsUnlimited(e.target.checked)} />
        </InputWithLeftLabelContainer>
        {!maxClaimsUnlimited && (
          <InputWithLeftLabelContainer>
            <Label>{t('online_gift_max_claims')}</Label>
            <Input
              type="number"
              min="1"
              value={maxClaimsValue}
              onChange={(e) => setMaxClaimsValue(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </InputWithLeftLabelContainer>
        )}

        <InputWithLeftLabelContainer>
          <Label>{t('online_gift_always_available')}</Label>
          <Toggle checked={alwaysAvailable} onChange={(e) => setAlwaysAvailable(e.target.checked)} />
        </InputWithLeftLabelContainer>
        {!alwaysAvailable && (
          <>
            <InputWithTopLabelContainer>
              <Label required>{t('online_gift_valid_from')}</Label>
              <Input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </InputWithTopLabelContainer>
            <InputWithTopLabelContainer>
              <Label required>{t('online_gift_valid_to')}</Label>
              <Input type="datetime-local" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
            </InputWithTopLabelContainer>
          </>
        )}

        <InputWithTopLabelContainer>
          <Label>{t('online_gift_rarity')}</Label>
          <StudioDropDown
            value={String(rarity)}
            options={RARITY_OPTIONS}
            onChange={(v) => setRarity(Number(v) as GiftRarity)}
          />
        </InputWithTopLabelContainer>

        {error && <ErrorText>{error}</ErrorText>}

        <ButtonContainer>
          <PrimaryButton onClick={onSubmit} disabled={submitting}>
            {submitting ? t('online_gift_submitting') : t('online_gift_submit')}
          </PrimaryButton>
          <DarkButton onClick={closeDialog} disabled={submitting}>
            {t('cancel')}
          </DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
});

CreateMysteryGiftEditor.displayName = 'CreateMysteryGiftEditor';
