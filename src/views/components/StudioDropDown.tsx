import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { AutoSizer, List } from 'react-virtualized';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { Input } from './inputs';
import { useTranslation } from 'react-i18next';

type DropDownOptionsProps = {
  height: number;
};

const DropDownOptions = styled.div<DropDownOptionsProps>`
  position: absolute;
  top: 44px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  min-width: 240px;
  width: 100%;
  height: ${(props) => props.height}px;
  padding: 8px 4px 8px 8px;
  left: -2px;
  z-index: 2;
  box-sizing: border-box;
  user-select: none;

  & .scrollable-view {
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      margin-bottom: 4px;
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

    & span {
      display: block;
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
  }

  & .no-option {
    display: block;
    padding: 8px 16px;
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
      color: ${({ theme }) => theme.colors.text100};
    }

    ${DropDownOptions} {
      visibility: visible;
      cursor: pointer;
    }

    & ${Input} {
      background-color: ${({ theme }) => theme.colors.dark12};
      cursor: default;
    }
  }

  &.error {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  & ${DropDownOptions} {
    visibility: hidden;
  }

  & ${Input} {
    min-width: 180px;
    width: calc(100% - 60px);
    height: 32px;
    padding: 0px;
    background-color: ${({ theme }) => theme.colors.dark20};
    border: none;
    outline: none;
    cursor: default;

    &.error {
      &::placeholder {
        color: ${({ theme }) => theme.colors.dangerBase};
      }
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text400};
    }
  }
`;

type DropDownOption = {
  value: string;
  label: string;
};

const research = (options: DropDownOption[], entry: string) => {
  if (!entry) return options;

  const entryLowerCase = entry.toLowerCase();
  return options.filter((option) => option.value.match(entry) || option.label.toLowerCase().match(entryLowerCase));
};

const getHeight = (options: DropDownOption[], isOpen: boolean) => {
  return isOpen ? (options.length >= 5 ? 207 : 16 + (options.length * 39 || 35)) : 0;
};

const getCurrentOption = (options: DropDownOption[], value: string) => {
  const index = options.findIndex((option) => option.value === value);
  if (index === -1) return undefined;

  return { option: options[index], index };
};

type StudioDropDownProps = {
  value: string;
  options: DropDownOption[];
  onChange: (value: string) => void;
  optionals?: {
    noOptionLabel?: string; // No move found, No Pokémon found, etc.
    deletedOption?: string; // Move deleted, Ability deleted, etc.
    disabledResearch?: true;
  };
};

export const StudioDropDown = ({ value, options, onChange, optionals }: StudioDropDownProps) => {
  const [entry, setEntry] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const optionsList = useMemo(() => research(options, entry), [options, entry]);
  const currentOption = useMemo(() => getCurrentOption(optionsList, value), [optionsList, value]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation('select');
  const notOpenClass = currentOption ? undefined : 'error';
  const label = currentOption?.option.label || optionals?.deletedOption || '???';

  useEffect(() => {
    const eventFunction = () => {
      if (!isOpen && document.activeElement === inputRef.current) return setIsOpen(true);
      setIsOpen(false);
      setEntry('');
      inputRef.current?.blur();
    };
    window.addEventListener('click', eventFunction);

    return () => window.removeEventListener('click', eventFunction);
  }, [isOpen]);

  const onClick = () => {
    if (!isOpen) inputRef.current?.focus();
    else inputRef.current?.blur();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntry(event.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <DropDownContainer className={isOpen ? 'open' : notOpenClass} onClick={onClick}>
      <Input
        ref={inputRef}
        className={notOpenClass}
        value={entry}
        onChange={onInputChange}
        placeholder={label}
        disabled={optionals?.disabledResearch}
      />
      <DownIcon />
      <DropDownOptions height={getHeight(optionsList, isOpen)}>
        {optionsList.length > 0 ? (
          <AutoSizer>
            {({ width, height }) => {
              return (
                <List
                  className="scrollable-view"
                  width={width}
                  height={height}
                  rowHeight={39}
                  rowCount={optionsList.length}
                  rowRenderer={({ key, index, style }) => {
                    const option = optionsList[index];
                    return (
                      <span
                        key={key}
                        onClick={() => isOpen && onChange(option.value)}
                        className={value === option.value ? 'current' : ''}
                        style={{ ...style, height: '35px', width: 'calc(100% - 4px)' }}
                      >
                        {option.label}
                      </span>
                    );
                  }}
                  scrollToIndex={currentOption?.index}
                  tabIndex={null}
                />
              );
            }}
          </AutoSizer>
        ) : (
          <span className="no-option">{optionals?.noOptionLabel || t('no_option')}</span>
        )}
      </DropDownOptions>
    </DropDownContainer>
  );
};
