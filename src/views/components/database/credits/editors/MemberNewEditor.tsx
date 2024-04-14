import { DarkButton, PrimaryButton } from '@components/buttons';
import { EditorWithCollapse } from '@components/editor/Editor';
import { Input, InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { StudioCreditConfig } from '@modelEntities/config';
import React, { useState } from 'react';
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
  const { t } = useTranslation('database_credits');
  const [role, setRole] = useState('');
  const [names, setNames] = useState('');
  const [newMember, setNewMember] = useState({ title: '', name: '' });

  //TODO fix imput text
  const inputRender = (key: string, value: string) => {
    return (
      <InputWithTopLabelContainer>
        <Label htmlFor={key}>{t(key)}</Label>
        <Input
          type="text"
          value={value}
          onChange={(event) => (key === 'role' ? setRole(event.target.value) : setNames(event.target.value))}
          placeholder={value}
        />
      </InputWithTopLabelContainer>
    );
  };

  const onClickNew = () => {
    setNewMember({ title: role, name: names });
    credits.leaders.push(newMember);
    onClose();
  };

  return (
    <EditorWithCollapse type="creation" title={t('developers')}>
      <InputContainer>
        {inputRender('role', credits.leaders[1].title)}
        {inputRender('names', credits.leaders[1].name)}
        <ButtonContainer>
          <PrimaryButton onClick={onClickNew}>{t('save')}</PrimaryButton>
          <TooltipWrapper data-tooltip={undefined}></TooltipWrapper>
          <DarkButton onClick={onClose}>{t('cancel')}</DarkButton>
        </ButtonContainer>
      </InputContainer>
    </EditorWithCollapse>
  );
};
