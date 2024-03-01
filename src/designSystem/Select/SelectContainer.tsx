import styled from 'styled-components';

export const SelectContainer = styled.div`
  display: flex;
  position: relative;
  height: 40px;
  min-width: 240px;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text400};
  ${({ theme }) => theme.fonts.normalMedium}

  & svg {
    position: absolute;
    right: 16px;
    top: calc((100% - 6px) / 2);
  }

  & input {
    box-sizing: border-box;
    padding: 9.5px 15px;
    margin: 0;
    background-color: ${({ theme }) => theme.colors.dark20};
    border: 1px solid transparent;
    border-radius: 8px;
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
    min-width: 180px;
    width: 100%;
    height: 40px;
    cursor: pointer;

    &:hover {
      border-color: ${({ theme }) => theme.colors.dark24};
      outline: 1.5px solid ${({ theme }) => theme.colors.dark24};
    }

    &:active,
    &:focus {
      border-color: ${({ theme }) => theme.colors.primaryBase};
      outline: 1.5px solid ${({ theme }) => theme.colors.primaryBase};
    }

    &:invalid::placeholder {
      color: ${({ theme }) => theme.colors.dangerBase};
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.text400};
    }

    &:invalid {
      color: ${({ theme }) => theme.colors.dangerBase};
    }
  }

  &:has(.visible) {
    color: ${({ theme }) => theme.colors.text400};

    svg {
      transform: rotate(180deg);
      color: ${({ theme }) => theme.colors.text100};
    }

    & input {
      background-color: ${({ theme }) => theme.colors.dark12};
      cursor: text;
    }
  }

  & > .select-popover {
    display: none;
    position: absolute;
    background-color: ${({ theme }) => theme.colors.dark20};
    border-radius: 8px;
    padding: 8px 4px 8px 8px;
    z-index: 2;
    box-shadow: 0px 2px 4px ${({ theme }) => theme.colors.dark14};
    user-select: none;
    cursor: default;
    overflow: hidden;
  }

  & > .select-popover.visible {
    display: block;
  }

  & .select-list {
    padding-right: 4px;

    & span {
      display: block;
      margin: 2px 0;
      max-height: 35px;
      max-width: calc(100% - 4px);
      padding: 8px 16px;
      border-radius: 8px;
      box-sizing: border-box;
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.text400};
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    & span.highlighted:not(.current),
    & span:hover:not(.current) {
      background-color: ${({ theme }) => theme.colors.dark22};
    }

    & span.current {
      color: ${({ theme }) => theme.colors.text100};
      background: ${({ theme }) => theme.colors.dark23};
    }

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
  }
`;
