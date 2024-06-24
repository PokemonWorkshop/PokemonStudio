import React from 'react';
import styled from 'styled-components';
import theme from '@src/AppTheme';
import { useTranslation } from 'react-i18next';

import { DeleteButton } from '@components/buttons';
import { DeletionContainer } from '@components/deletion/DeletionContainer';
import { useProjectPokemon } from '@hooks/useProjectData';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useDexPage } from '@hooks/usePage';
import { useUpdateDex } from './editors/useUpdateDex';

const TitleContainer = styled.div`
  padding-top: 8px;

  & > h3 {
    ${theme.fonts.titlesHeadline6};
    margin: 0;
    line-height: 22px;
    text-align: center;
  }
`;

const TextWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  & > p {
    margin: 0;
    text-align: center;
  }

  .red {
    color: ${theme.colors.dangerBase};
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
`;

const CancelLink = styled.span`
  ${theme.fonts.normalMedium};
  color: ${theme.colors.text400};

  :hover {
    cursor: pointer;
  }
`;

type DexResetNationalPopUpProps = {
  onClose: () => void;
};

export const DexResetNationalPopUp = ({ onClose }: DexResetNationalPopUpProps) => {
  const { t } = useTranslation(['deletion', 'database_dex']);
  const { projectDataValues: allPokemon } = useProjectPokemon();
  const { dex } = useDexPage();
  const updateDex = useUpdateDex(dex);

  const onClickReset = () => {
    dex.creatures = Object.entries(allPokemon)
      .map(([dbSymbol, pokemonData]) => ({ dbSymbol: dbSymbol as DbSymbol, index: pokemonData.id }))
      .sort((a, b) => a.index - b.index)
      .map((data) => ({ dbSymbol: data.dbSymbol, form: 0 }));
    updateDex(dex);
    onClose();
  };

  return (
    <DeletionContainer>
      <TitleContainer>
        <h3>{t('database_dex:reset_national_title')}</h3>
      </TitleContainer>
      <TextWarningContainer>
        <p>{t('database_dex:reset_national_warning_message')}</p>
        <p className="red">{t('deletion:action_irreversible')}</p>
      </TextWarningContainer>
      <ActionContainer>
        <CancelLink onClick={onClose}>{t('deletion:cancel')}</CancelLink>
        <DeleteButton onClick={onClickReset}>{t('database_dex:reset_national_action')}</DeleteButton>
      </ActionContainer>
    </DeletionContainer>
  );
};
