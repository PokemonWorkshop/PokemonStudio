import React, { useEffect, useState } from 'react';
import { showNotification } from '@utils/showNotification';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const TitleBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.dark16};
  margin-bottom: 2px;
  -webkit-app-region: drag;
`;

const TitleBarHeader = styled.span`
  display: flex;
  align-items: center;
  height: 24px;
  ${({ theme }) => theme.fonts.titlesHeadline4}
  font-size: 14px;
  letter-spacing: 0.25px;
  color: ${({ theme }) => theme.colors.text500};
  margin-left: 12px;
`;

const TitleBarActions = styled.div`
  display: flex;
  flex-direction: row;
  height: 24px;
  -webkit-app-region: no-drag;
  ${({ theme }) => theme.fonts.windowsIcons}
  color: ${({ theme }) => theme.colors.text100};
  user-select: none;

  & .minimize,
  & .unmaximize,
  & .maximize {
    display: flex;
    width: 40px;
    align-items: center;
    justify-content: center;

    :hover,
    :active {
      background-color: ${({ theme }) => theme.colors.dark24};
    }
  }

  & .close {
    display: flex;
    width: 40px;
    align-items: center;
    justify-content: center;

    :hover,
    :active {
      background-color: ${({ theme }) => theme.colors.dangerBase};
    }
  }
`;

export const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(true);
  const { t } = useTranslation('update');

  const listenerUpdateAvailable: Parameters<typeof window.api.requestUpdateAvailable.on>[0] = async () => {
    showNotification('info', t('studio_update_available_title'), t('studio_update_available'));
  };

  const listenerUpdateDownloaded: Parameters<typeof window.api.requestUpdateDownloaded.on>[0] = async () => {
    showNotification('info', t('studio_update_downloaded_title'), t('studio_update_downloaded'));
  };

  const onClickToggleMaximizeMode = () => {
    setIsMaximized(!isMaximized);
    window.api.toggleMaximizeMode();
  };

  useEffect(() => {
    window.api.checkUpdate();
    window.api.requestUpdateAvailable.on(listenerUpdateAvailable);
    window.api.requestUpdateDownloaded.on(listenerUpdateDownloaded);

    return () => {
      window.api.requestUpdateAvailable.removeListener(listenerUpdateAvailable);
      window.api.requestUpdateDownloaded.removeListener(listenerUpdateDownloaded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return window.api.platform === 'win32' ? (
    <TitleBarContainer>
      <TitleBarHeader>Pokémon Studio</TitleBarHeader>
      <TitleBarActions>
        <span className="minimize" onClick={window.api.minimize}>
          &#xE921;
        </span>
        <span className="maximize" onClick={onClickToggleMaximizeMode}>
          &#xE922;
        </span>
        <span className="close" onClick={window.api.close}>
          &#xE8BB;
        </span>
      </TitleBarActions>
    </TitleBarContainer>
  ) : (
    <></>
  );
};
