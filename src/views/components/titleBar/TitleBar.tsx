import React, { useState } from 'react';
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

  const toggleMaximizeMode = () => {
    setIsMaximized(!isMaximized);
    window.api.toggleMaximizeMode();
  };

  return window.api.platform === 'win32' ? (
    <TitleBarContainer>
      <TitleBarHeader>Pokémon Studio</TitleBarHeader>
      <TitleBarActions>
        <span className="minimize" onClick={window.api.minimize}>
          &#xE921;
        </span>
        <span className="maximize" onClick={toggleMaximizeMode}>
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
