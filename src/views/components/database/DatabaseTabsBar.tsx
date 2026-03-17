import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

type DatabaseTabsBarContainerProps = {
  $autoWidth?: boolean;
};

const DatabaseTabsBarContainer = styled.div<DatabaseTabsBarContainerProps>`
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 12px;
  box-sizing: border-box;
  width: ${({ $autoWidth }) => ($autoWidth ? 'auto' : '1024px')};
  height: 48px;
  padding: 4px;
  align-items: center;
  overflow: hidden;
  user-select: none;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    width: ${({ $autoWidth }) => ($autoWidth ? 'auto' : '504px')};
  }
`;

type TabContainerProps = {
  disabled?: boolean;
};

const TabContainer = styled.div.attrs<TabContainerProps>((props) => ({
  'data-disabled': props.disabled ? true : undefined,
  tabIndex: props.disabled ? -1 : 0,
  role: 'tab',
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

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark16};
    cursor: pointer;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primaryBase};
    outline-offset: -2px;
  }

  &.current-tab {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
  }

  &[data-disabled] {
    & span {
      color: ${({ theme }) => theme.colors.text500};
    }

    &:hover {
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
  onClick?: (index: number) => void;
  autoWidth?: boolean;
};

export const DatabaseTabsBar = ({ currentTabIndex, tabs, onClick, autoWidth }: DatabaseTabBarProps) => {
  const navigate = useNavigate();
  const tabsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    tabsRef.current = tabsRef.current.slice(0, tabs.length);
  }, [tabs.length]);

  const handleTabClick = (index: number, tab: TabType) => {
    if (tab.disabled) return;
    onClick ? onClick(index) : navigate(tab.path);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number, tab: TabType) => {
    if (tab.disabled) return;

    const enabledTabs = tabs.map((t, i) => ({ ...t, index: i })).filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.index === index);

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabClick(index, tab);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (currentEnabledIndex < enabledTabs.length - 1) {
          const nextTab = enabledTabs[currentEnabledIndex + 1];
          tabsRef.current[nextTab.index]?.focus();
        }
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (currentEnabledIndex > 0) {
          const prevTab = enabledTabs[currentEnabledIndex - 1];
          tabsRef.current[prevTab.index]?.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        if (enabledTabs.length > 0) {
          tabsRef.current[enabledTabs[0].index]?.focus();
        }
        break;

      case 'End':
        event.preventDefault();
        if (enabledTabs.length > 0) {
          tabsRef.current[enabledTabs[enabledTabs.length - 1].index]?.focus();
        }
        break;
    }
  };

  return (
    <DatabaseTabsBarContainer $autoWidth={autoWidth} role="tablist">
      {tabs.map((tab, index) => (
        <React.Fragment key={`database-tab-${index}`}>
          <TabContainer
            ref={(el) => (tabsRef.current[index] = el)}
            className={currentTabIndex === index ? 'current-tab' : undefined}
            onClick={() => handleTabClick(index, tab)}
            onKeyDown={(e) => handleKeyDown(e, index, tab)}
            disabled={tab.disabled}
            aria-selected={currentTabIndex === index}
            aria-disabled={tab.disabled}
          >
            <span>{tab.label}</span>
          </TabContainer>
          {index < tabs.length - 1 && <SeparatorStyle />}
        </React.Fragment>
      ))}
    </DatabaseTabsBarContainer>
  );
};
