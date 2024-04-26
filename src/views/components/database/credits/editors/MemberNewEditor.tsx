import React, { useState } from 'react';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { Editor } from '@components/editor/Editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useConfigCredits } from '@utils/useProjectConfig';
import { StudioCreditConfig } from '@modelEntities/config';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TooltipWrapper } from '@ds/Tooltip';

const InfoContainer = styled.span`
  ${({ theme }) => theme.fonts.normalSmall}
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type InputKeys = 'title' | 'name';

type CreditsNewMemberEditorProps = {
  credits: StudioCreditConfig;
  onClose: () => void;
};

export const MemberNewEditor = ({ credits, onClose }: CreditsNewMemberEditorProps) => {
  const { setProjectConfigValues: setCredits } = useConfigCredits();
  const { t } = useTranslation(['dashboard_credits', 'database_moves']);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');

  const handleInputChange = (key: string, value: string) => {
    key === 'title' ? setTitle(value) : setName(value);
  };

  const checkDisabled = () => !title || !name;

  const inputRender = (key: InputKeys, label: string, value: string) => {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor={label} required>
          {label}
        </Label>
        <Input
          type="text"
          value={value}
          onChange={(event) => handleInputChange(key, event.target.value)}
          placeholder={key === 'title' ? t('dashboard_credits:project_leader') : t('dashboard_credits:leader_name')}
        />
        {key === 'name' && <InfoContainer>{t('dashboard_credits:names_info_edition')}</InfoContainer>}
      </InputWithTopLabelContainer>
    );
  };

  const onClickSave = () => {
    if (checkDisabled()) return;

    credits.leaders.push({ title, name });
    setCredits({ ...credits });
    onClose();
  };

  return (
    <Editor type="creation" title={t('dashboard_credits:developers')}>
      <InputContainer>
        {inputRender('title', t('dashboard_credits:role'), title)}
        {inputRender('name', t('dashboard_credits:names'), name)}
        <ButtonContainer>
          <TooltipWrapper data-tooltip={checkDisabled() ? t('database_moves:fields_asterisk_required') : undefined}>
            <PrimaryButton onClick={onClickSave} disabled={checkDisabled()}>
              {t('dashboard_credits:save')}
            </PrimaryButton>
          </TooltipWrapper>
          <DarkButton onClick={onClose}>{t('dashboard_credits:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </Editor>
  );
};
