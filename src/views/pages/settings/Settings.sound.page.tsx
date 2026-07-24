import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageEditor, PageTemplate } from '@components/pages';
import { InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { isSoundEnabled, setSoundEnabled } from '@utils/sound';

const HelpText = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
`;

export const SettingsSoundPage = () => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(isSoundEnabled());

  const onToggle = (value: boolean) => {
    setEnabled(value);
    setSoundEnabled(value);
  };

  return (
    <PageTemplate title={t('sound')} size="default">
      <PageEditor title={t('sound')} editorTitle={t('sound')}>
        <InputWithLeftLabelContainer>
          <Label htmlFor="sound_enabled">{t('sound_enabled')}</Label>
          <Toggle name="sound_enabled" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
        </InputWithLeftLabelContainer>
        <HelpText>{t('sound_enabled_help')}</HelpText>
      </PageEditor>
    </PageTemplate>
  );
};
