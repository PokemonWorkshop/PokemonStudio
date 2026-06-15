import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { PageEditor, PageTemplate } from '@components/pages';
import { Input, InputWithTopLabelContainer, Label } from '@components/inputs';
import { PrimaryButton } from '@components/buttons';
import { useOnlineConfig } from '@hooks/useOnlineConfig';
import { onlineHealth } from '@utils/onlineApi';

const Warning = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.warningBase};
  display: block;
  margin-top: 4px;
`;

const HelpText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  display: block;
  margin-top: 4px;
`;

const TestRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

type HealthState = { status: 'idle' } | { status: 'loading' } | { status: 'ok'; uptime: number | null } | { status: 'error'; message: string };

const StatusBadge = styled.span<{ tone: 'ok' | 'error' | 'idle' }>`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme, tone }) =>
    tone === 'ok' ? theme.colors.successBase : tone === 'error' ? theme.colors.dangerBase : theme.colors.text400};
`;

export const OnlineSettingsPage = () => {
  const { t } = useTranslation();
  const { config, update } = useOnlineConfig();
  const [health, setHealth] = useState<HealthState>({ status: 'idle' });

  const handleTest = async () => {
    setHealth({ status: 'loading' });
    try {
      const result = await onlineHealth();
      if (result.ok && typeof result.body === 'object' && result.body !== null) {
        const body = result.body as { status?: string; uptime?: number };
        setHealth({ status: 'ok', uptime: typeof body.uptime === 'number' ? body.uptime : null });
      } else {
        setHealth({ status: 'error', message: result.error ?? `HTTP ${result.status}` });
      }
    } catch (err) {
      setHealth({ status: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <PageTemplate title={t('online_settings')} size="default">
      <PageEditor title={t('online_server_configuration')} editorTitle={t('online_settings')}>
        <InputWithTopLabelContainer>
          <Label>{t('online_base_url')}</Label>
          <Input
            type="text"
            placeholder="http://50.21.190.201:3000"
            value={config.baseUrl}
            onChange={(e) => update('baseUrl', e.target.value)}
          />
          <HelpText>{t('online_base_url_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_api_key')}</Label>
          <Input type="password" placeholder="x-api-key" value={config.apiKey} onChange={(e) => update('apiKey', e.target.value)} />
          <HelpText>{t('online_api_key_help')}</HelpText>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_admin_key')}</Label>
          <Input type="password" placeholder="x-admin-key" value={config.adminKey} onChange={(e) => update('adminKey', e.target.value)} />
          <Warning>{t('online_admin_key_warning')}</Warning>
        </InputWithTopLabelContainer>

        <InputWithTopLabelContainer>
          <Label>{t('online_player_id')}</Label>
          <Input type="text" placeholder="uuid" value={config.playerId} onChange={(e) => update('playerId', e.target.value)} />
          <HelpText>{t('online_player_id_help')}</HelpText>
        </InputWithTopLabelContainer>
      </PageEditor>

      <PageEditor title={t('online_test_connection')} editorTitle={t('online_settings')}>
        <TestRow>
          <PrimaryButton onClick={handleTest} disabled={!config.baseUrl || health.status === 'loading'}>
            {health.status === 'loading' ? t('online_testing') : t('online_test_button')}
          </PrimaryButton>
          {health.status === 'ok' && (
            <StatusBadge tone="ok">
              {t('online_test_ok')}
              {health.uptime !== null ? ` — ${Math.floor(health.uptime)}s uptime` : ''}
            </StatusBadge>
          )}
          {health.status === 'error' && <StatusBadge tone="error">{health.message}</StatusBadge>}
          {health.status === 'idle' && <StatusBadge tone="idle">{t('online_test_idle')}</StatusBadge>}
        </TestRow>
        <HelpText>{t('online_test_help')}</HelpText>
      </PageEditor>
    </PageTemplate>
  );
};
