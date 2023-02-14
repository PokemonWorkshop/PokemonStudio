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

const LatestVersionContainer = styled.div`
  display: flex;
  ${({ theme }) => theme.fonts.normalMedium}

  .latest-version-text {
    color: ${({ theme }) => theme.colors.text400};
  }

  .latest-version {
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const Footer = ({ version }: { version: string }) => {
  const { t } = useTranslation(['psdk_update']);

  return (
    <FooterContainer>
      <LinkContainer>
        <Link external href="https://psdk.pokemonworkshop.fr/wiki/en/index.html" text={t('psdk_update:wiki')} />
        <Link external href="https://psdk.pokemonworkshop.com/yard/" text={t('psdk_update:documentation')} />
        <Link external href="https://gitlab.com/pokemonsdk/pokemonsdk" text={t('psdk_update:gitlab')} />
        <Link external href="https://twitter.com/pokemonsdk" text={t('psdk_update:twitter')} />
      </LinkContainer>
      {version && (
        <LatestVersionContainer>
          <div className="latest-version-text">{t('psdk_update:latest_version')}&nbsp;</div>
          <div className="latest-version">{version}</div>
        </LatestVersionContainer>
      )}
    </FooterContainer>
  );
};

export { Footer };
