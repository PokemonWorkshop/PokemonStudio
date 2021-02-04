import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderStyle from './HeaderStyle';

const Header: FunctionComponent = () => {
  const { t } = useTranslation(['homepage']);

  return (
    <HeaderStyle>
      <span>
        {t('homepage:version_current_version_editor', {
          current_version_editor: '0.00',
        })}
      </span>
    </HeaderStyle>
  );
};

export { Header };
