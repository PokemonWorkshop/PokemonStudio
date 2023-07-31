import styled from 'styled-components';

type NavigationBarItemContainerProps = {
  disabled?: boolean;
};

export const NavigationBarItemContainer = styled.div<NavigationBarItemContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;

  &:hover {
    ${({ disabled, theme }) => !disabled && `background-color: ${theme.colors.dark18};`}
  }
`;
