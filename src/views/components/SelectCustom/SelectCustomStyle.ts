import Select from 'react-select';
import { List } from 'react-virtualized';
import styled from 'styled-components';
import { SelectElementType } from './SelectCustomPropsInterface';

export const ListElement = styled(List)`
  padding: 0px 4px;

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
`;

export const SelectElement = styled(Select)<SelectElementType>`
  .react-select__control {
    width: 240px;
    height: 40px;
    background-color: ${({ theme }) => theme.colors.dark20};
    border-radius: 8px;
    border: 2px solid transparent;
    box-sizing: border-box;
    border-radius: 8px;
    box-shadow: none;
  }

  .react-select__control:hover {
    border: 2px solid ${({ theme }) => theme.colors.text500};
  }

  .react-select__control--is-focused {
    background-color: ${({ theme }) => theme.colors.dark12};
    border: 2px solid ${({ theme }) => theme.colors.primaryBase};

    .react-select__single-value {
      color: ${({ theme, error }) => (error ? theme.colors.dangerBase : theme.colors.text400)};
      ${({ theme }) => theme.fonts.normalMedium}
      line-height: 19px;
      padding-left: 8px;
    }
    .react-select__indicators {
      div {
        color: ${(props) => props.theme.colors.text100};
        svg {
          transform: rotate(180deg);
        }
      }
    }
  }

  .react-select__control--is-focused:hover {
    background: ${({ theme }) => theme.colors.dark12};
    border: 2px solid ${({ theme }) => theme.colors.primaryBase};
  }

  .react-select__single-value {
    color: ${({ theme, error }) => (error ? theme.colors.dangerBase : theme.colors.text400)};
    ${({ theme }) => theme.fonts.normalMedium}
    line-height: 19px;
    padding: 0px 8px;
    user-select: none;
  }

  .react-select__indicators {
    span {
      width: 0;
    }
    div {
      color: ${({ theme }) => theme.colors.text400};
    }
  }

  .react-select__input-container {
    color: ${({ theme }) => theme.colors.text100};
    ${({ theme }) => theme.fonts.normalMedium}
    line-height: 19px;
    padding: 0px 8px;
  }

  .react-select__menu {
    background: ${({ theme }) => theme.colors.dark20};
    border-radius: 8px;
    padding: 8px 4px;
    height: ${({ height }) => height};
    width: 240px;
  }

  .react-select__option {
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium}
    line-height: 19px;
    padding: 8px 16px;
    border-radius: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .react-select__option:hover {
    background: ${({ theme }) => theme.colors.dark22};
  }

  .react-select__option--is-focused {
    background: ${({ theme }) => theme.colors.dark22};
  }

  .react-select__option--is-selected {
    color: ${({ theme }) => theme.colors.text100};
    background: ${({ theme }) => theme.colors.dark23};
  }

  .react-select__option--is-selected:hover {
    color: ${({ theme }) => theme.colors.text100};
    background: ${({ theme }) => theme.colors.dark23};
  }

  .no-option {
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium};
    text-overflow: ellipsis;
    padding: 8px 16px;
    margin: 4px;
    cursor: default;
  }
`;
