import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DataBlockContainer } from '../dataBlocks';

const DexResetNationalContainer = styled(DataBlockContainer)`
  h2 {
    margin-bottom: 8px;
  }
`;

const InfoResetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DexResetInfo = styled.span`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  user-select: none;
`;

const ResetStyle = styled.span`
  ${({ theme }) => theme.fonts.normalMedium};
  color: ${({ theme }) => theme.colors.primaryBase};
  max-width: max-content;
  user-select: none;

  :hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    cursor: pointer;
  }
`;

type DexResetNationalProps = {
  onClickReset: () => void;
};

export const DexResetNational = ({ onClickReset }: DexResetNationalProps) => {
  const { t } = useTranslation('database_dex');
  return (
    <DexResetNationalContainer size="full" data-noactive>
      <h2>{t('reset_national_title')}</h2>
      <InfoResetContainer>
        <DexResetInfo>{t('reset_national_info')}</DexResetInfo>
        <ResetStyle onClick={onClickReset}>{t('reset_national_action')}</ResetStyle>
      </InfoResetContainer>
    </DexResetNationalContainer>
  );
};
