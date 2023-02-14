import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';

type ScrollableViewProps = {
  height: number;
};

const ScrollableView = styled.div<ScrollableViewProps>`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  height: ${(props) => props.height}px;
  scrollbar-gutter: auto;
  box-sizing: border-box;
  gap: 4px;
  background-clip: border-box;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${({ theme }) => theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.colors.dark15};
    border-color: ${({ theme }) => theme.colors.text400};
  }
`;

const DropDownOptions = styled.div`
  position: absolute;
  top: 44px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  min-width: 240px;
  width: 100%;
  padding: 4px;
  left: -2px;
  z-index: 2;
  box-sizing: border-box;
  user-select: none;
`;

const DropDownOptionsScrollableView = styled(ScrollableView)`
  min-width: 232px;
  padding: 4px;

  & span {
    display: block;
    min-height: 35px;
    padding: 8px 16px;
    border-radius: 8px;
    box-sizing: border-box;
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text400};
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & span.current {
    color: ${({ theme }) => theme.colors.text100};
    background: ${({ theme }) => theme.colors.dark23};
  }

  & span:hover:not(span.current) {
    background-color: ${({ theme }) => theme.colors.dark22};
  }
`;

const DropDownContainer = styled.div`
  display: flex;
  position: relative;
  padding: 9px 12px 9px 18px;
  height: 40px;
  min-width: 240px;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.text400};
  box-sizing: border-box;
  border: 2px solid transparent;
  white-space: nowrap;
  user-select: none;

  & span.value {
    min-width: 180px;
    width: calc(100% - 60px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    border: 2px solid ${({ theme }) => theme.colors.text500};
  }

  &.open,
  &.open:hover {
    color: ${({ theme }) => theme.colors.text400};
    border: 2px solid ${({ theme }) => theme.colors.primaryBase};
    background-color: ${({ theme }) => theme.colors.dark12};
    svg {
      transform: rotate(180deg);
    }
    ${DropDownOptions} {
      visibility: visible;
    }
  }

  &.error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & ${DropDownOptions} {
    visibility: hidden;
  }
`;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore TODO: Fix this for real ???
const ReactTooltipStyled = styled(ReactTooltip)`
  padding: 8px !important;
  border-radius: 4px !important;
  background-color: ${({ theme }) => theme.colors.dark8} !important;
  color: ${({ theme }) => theme.colors.text100} !important;
  /* normalRegular */
  font-family: Avenir Next !important;
  font-weight: 400 !important;
  font-size: 14px !important;
`;

type DropDownOption = {
  value: string;
  label: string;
};

type SelectCustomSimpleProps = {
  id: string;
  value: string;
  options: DropDownOption[];
  noTooltip?: true;
  onChange: (value: string) => void;
};

export const SelectCustomSimple = ({ id, value, options, noTooltip, onChange }: SelectCustomSimpleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find((option) => option.value === value);
  const notOpenClass = currentOption ? undefined : 'error';
  const label = currentOption?.label || '???';

  useEffect(() => {
    const eventFunction = () => isOpen && setIsOpen(false);
    window.addEventListener('click', eventFunction);

    return () => window.removeEventListener('click', eventFunction);
  }, [isOpen]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getHeight = () => {
    return isOpen ? (options.length >= 5 ? 207 : 4 + options.length * 39) : 0;
  };

  return (
    <DropDownContainer id={id} className={isOpen ? 'open' : notOpenClass} onClick={onClick}>
      <span className="value">{label}</span>
      <DownIcon />
      <DropDownOptions>
        <DropDownOptionsScrollableView height={getHeight()}>
          {options.map((option) =>
            noTooltip ? (
              <span key={`${id}-${option.value}`} onClick={() => isOpen && onChange(option.value)} className={value == option.value ? 'current' : ''}>
                {option.label}
              </span>
            ) : (
              <span
                key={`${id}-${option.value}`}
                onClick={() => isOpen && onChange(option.value)}
                data-tip={option.label}
                className={value == option.value ? 'current' : ''}
              >
                {option.label}
              </span>
            )
          )}
        </DropDownOptionsScrollableView>
      </DropDownOptions>
      {!noTooltip && <ReactTooltipStyled delayShow={200} arrowColor="transparent" />}
    </DropDownContainer>
  );
};
