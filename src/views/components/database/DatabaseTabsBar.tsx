import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const DatabaseTabsBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 12px;
  box-sizing: border-box;
  width: 1024px;
  height: 48px;
  padding: 4px;
  align-items: center;
  overflow: hidden;
  user-select: none;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    width: 504px;
  }
`;

type TabContainerProps = {
  disabled?: boolean;
};

const TabContainer = styled.div.attrs<TabContainerProps>((props) => ({
  'data-disabled': props.disabled ? true : undefined,
}))<TabContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 75px;
  width: 100%;
  height: 40px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text400};

  & span {
    ${({ theme }) => theme.fonts.normalRegular}

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  & :hover {
    background-color: ${({ theme }) => theme.colors.dark16};
    cursor: pointer;
  }

  &.current-tab {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
  }

  &[data-disabled] {
    & span {
      color: ${({ theme }) => theme.colors.text500};
    }

    & :hover {
      background-color: transparent;
      cursor: default;
    }
  }
`;

const SeparatorStyle = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.dark20};
  height: 24px;
`;

type TabType = {
  label: string;
  path: string;
  disabled?: boolean;
};

type DatabaseTabBarProps = {
  currentTabIndex: number;
  tabs: TabType[];
};

export const DatabaseTabsBar = ({ currentTabIndex, tabs }: DatabaseTabBarProps) => {
  const history = useHistory();
  return (
    <DatabaseTabsBarContainer>
      {tabs.map((tab, index) => (
        <>
          <TabContainer
            key={`database-tab-${index}`}
            className={currentTabIndex === index ? 'current-tab' : undefined}
            onClick={() => tab.disabled ?? history.push(tab.path)}
            disabled={tab.disabled}
          >
            <span>{tab.label}</span>
          </TabContainer>
          {index < tabs.length - 1 && <SeparatorStyle />}
        </>
      ))}
    </DatabaseTabsBarContainer>
  );
};
