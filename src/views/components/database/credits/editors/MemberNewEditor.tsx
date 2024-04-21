import React, { useState } from 'react';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor/Editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useConfigCredits } from '@utils/useProjectConfig';
import { StudioCreditConfig } from '@modelEntities/config';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { TooltipWrapper } from '@ds/Tooltip';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 0;
  gap: 8px;
`;

type CreditsNewMemberEditorProps = {
  credits: StudioCreditConfig;
  onClose: () => void;
};

export const MemberNewEditor = ({ credits, onClose }: CreditsNewMemberEditorProps) => {
  const { setProjectConfigValues: setCredits } = useConfigCredits();
  const { t } = useTranslation('database_credits');
  const [title, setTitle] = useState(credits.leaders[1].title);
  const [name, setName] = useState(credits.leaders[1].name);

  const handleInputChange = (key: string, value: string) => {
    key === 'title' ? setTitle(value) : setName(value);
  };

  const inputRender = (key: string, value: string) => {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor={key}>{t(key)}</Label>
        <Input type="text" value={value} onChange={(event) => handleInputChange(key, event.target.value)} placeholder={value} />
      </InputWithTopLabelContainer>
    );
  };

  const onClickSave = () => {
    credits.leaders.push({ title, name });
    setCredits({ ...credits });
    onClose();
  };

  return (
    <EditorWithCollapse type="creation" title={t('database_credits:developers')}>
      <InputContainer>
        {inputRender('title', title)}
        {inputRender('name', name)}
        <ButtonContainer>
          <PrimaryButton onClick={onClickSave}>{t('database_credits:save')}</PrimaryButton>
          <TooltipWrapper data-tooltip={undefined}></TooltipWrapper>
          <DarkButton onClick={onClose}>{t('database_credits:cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
};
