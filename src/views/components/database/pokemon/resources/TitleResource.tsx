import { Toggle } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TitleResourceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline4}
  }
`;

type TitleResourceProps = {
  title: string;
};

export const TitleResource = ({ title }: TitleResourceProps) => {
  return (
    <TitleResourceContainer>
      <span className="title">{title}</span>
    </TitleResourceContainer>
  );
};

const TitleResourceWithToggleContainer = styled(TitleResourceContainer)`
  .female-toggle {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 8px 12px;
    gap: 16px;
    box-sizing: border-box;
    height: 35px;
    background: ${({ theme }) => theme.colors.dark14};
    border: 1px solid ${({ theme }) => theme.colors.dark20};
    border-radius: 4px;
    ${({ theme }) => theme.fonts.normalRegular};
  }
`;

type TitleResourceWithToggleProps = {
  isShowFemale: boolean;
  onShowFemale: (female: boolean) => void;
} & TitleResourceProps;

export const TitleResourceWithToggle = ({ title, isShowFemale, onShowFemale }: TitleResourceWithToggleProps) => {
  const { t } = useTranslation('database_pokemon');
  return (
    <TitleResourceWithToggleContainer>
      <span className="title">{title}</span>
      <div className="female-toggle">
        <span>{t('show_female_sprites')}</span>
        <Toggle name="show-female" checked={isShowFemale} onChange={(event) => onShowFemale(event.target.checked)} />
      </div>
    </TitleResourceWithToggleContainer>
  );
};
