import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Link } from '@components/Link';

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
  ${({ theme }) => theme.fonts.normalMedium}
`;

const Footer = () => {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <LinkContainer>
        <Link external href="https://psdk.pokemonworkshop.com/yard/" text={t('documentation')} />
        <Link external href="https://psdk.pokemonworkshop.fr/wiki/en/index.html" text={t('getting_started')} />
        <Link external href="https://discord.gg/0noB0gBDd91B8pMk" text={t('discord')} />
        <Link external href="https://twitter.com/pokemonworkshop" text={t('twitter')} />
      </LinkContainer>
    </FooterContainer>
  );
};

export { Footer };
