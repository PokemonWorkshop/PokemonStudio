import Select from 'react-select';
import styled from 'styled-components';

export const SelectCustomStyle = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  #label {
    font-size: 14px;
    user-select: none;
  }
`;

export const SelectElementStyle = styled(Select)`
  .react-select-container {
    width: 240px;
  }

  .react-select__control {
    width: 240px;
    height: 40px;
    background: ${(props) => props.theme.colors.dark20};
    border-radius: 8px;
    border: 2px solid transparent;
    box-sizing: border-box;
    border-radius: 8px;
  }

  .react-select__control:hover {
    border: 2px solid ${(props) => props.theme.colors.text500};
  }

  .react-select__control--is-focused {
    background: ${(props) => props.theme.colors.dark12};
    border: 2px solid ${(props) => props.theme.colors.primaryBase};

    .react-select__single-value {
      color: ${(props) => props.theme.colors.text100};
      font-weight: 500;
      font-size: 14px;
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
    background: ${(props) => props.theme.colors.dark12};
    border: 2px solid ${(props) => props.theme.colors.primaryBase};
  }

  .react-select__single-value {
    color: ${(props) => props.theme.colors.text400};
    font-weight: 500;
    font-size: 14px;
    line-height: 19px;
    padding-left: 8px;
  }

  .react-select__indicators {
    span {
      width: 0;
    }
    div {
      color: ${(props) => props.theme.colors.text400};
    }
  }

  .react-select__input-container {
    color: ${(props) => props.theme.colors.text100};
    font-weight: 500;
    font-size: 14px;
    line-height: 19px;
    padding-left: 8px;
  }

  .react-select__menu {
    background: ${(props) => props.theme.colors.dark20};
    border-radius: 8px;
    height: 207px;
    padding: 4px 4px;
  }

  .react-select__menu-list {
    height: 195px;
    padding-left: 4px;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .react-select__menu-list::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .react-select__menu-list::-webkit-scrollbar-track {
    margin: 4px 0;
  }

  .react-select__menu-list::-webkit-scrollbar-corner {
    background-color: ${(props) => props.theme.colors.dark12};
  }

  .react-select__menu-list::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.text500};
    border-radius: 4px;
  }

  .react-select__menu-list::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.dark15};
    border: 1px solid ${(props) => props.theme.colors.text400};
  }

  .react-select__option {
    color: ${(props) => props.theme.colors.text400};
    font-weight: 500;
    font-size: 14px;
    line-height: 19px;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .react-select__option:hover {
    background: ${(props) => props.theme.colors.dark22};
  }

  .react-select__option--is-focused {
    background: ${(props) => props.theme.colors.dark22};
  }

  .react-select__option--is-selected {
    color: ${(props) => props.theme.colors.text100};
    background: ${(props) => props.theme.colors.dark23};
  }

  .react-select__option--is-selected:hover {
    color: ${(props) => props.theme.colors.text100};
    background: ${(props) => props.theme.colors.dark23};
  }

  .react-select__menu-notice {
    color: ${(props) => props.theme.colors.text400};
    font-weight: 500;
    font-size: 14px;
    text-align: left;
    text-overflow: ellipsis;
    padding: 8px 16px;
    overflow: hidden;
  }
`;
