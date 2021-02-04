import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../../Link';
import FooterStyle from './FooterStyle';

const Footer: FunctionComponent = () => {
  const { t } = useTranslation(['homepage']);

  return (
    <FooterStyle>
      <div id="left">
        <Link
          external
          href="https://psdk.pokemonworkshop.com/yard/"
          text={t('homepage:documentation')}
        />
        <Link
          external
          href="https://psdk.pokemonworkshop.fr/wiki/en/index.html"
          text={t('homepage:getting_started')}
        />
        <Link
          external
          href="https://download.psdk.pokemonworkshop.com/changelog.html"
          text={t('homepage:whats_up')}
        />
        <Link
          external
          href="https://pokemonworkshop.fr/forum/index.php?PHPSESSID=b1b46af3a4a6ce9d43928d3d8246dc4b&board=42.0"
          text={t('homepage:discord')}
        />
        <Link
          external
          href="https://twitter.com/pokemonworkshop"
          text={t('homepage:twitter')}
        />
      </div>
      <div id="right">
        <span>{t('homepage:a_pokemon_workshop_project')}</span>
      </div>
    </FooterStyle>
  );
};

export { Footer };
