import styled from 'styled-components';

type ButtonProps = {
  disabled?: boolean;
};

export const BaseButtonStyle = styled.a.attrs<ButtonProps>((props) => ({
  'data-disabled': props.disabled ? true : undefined,
}))<ButtonProps>`
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: center;
  padding: 0 16px;
  height: 40px;
  border-radius: 8px;
  gap: 4px;
  font-size: 14px;
  user-select: none;

  &[href] {
    text-decoration: none;
  }

  &[data-disabled] {
    pointer-events: none;
    color: ${({ theme }) => theme.colors.text700};
    background-color: ${({ theme }) => theme.colors.dark14};
  }

  &:visited {
    text-decoration: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

export const PrimaryButton = styled(BaseButtonStyle)`
  color: ${({ theme }) => theme.colors.text100};
  background-color: ${({ theme }) => theme.colors.primaryBase};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

export const SecondaryButton = styled(BaseButtonStyle)`
  color: ${({ theme }) => theme.colors.primaryBase};
  background-color: ${({ theme }) => theme.colors.primarySoft};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryHover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }
`;

export const SecondaryNoBackground = styled(SecondaryButton)`
  padding: 0;
  height: unset;
  background-color: unset;

  &:hover {
    background-color: unset;
  }

  &:active {
    background-color: unset;
  }
`;

export const DarkButton = styled(BaseButtonStyle)`
  color: ${({ theme }) => theme.colors.text400};
  background-color: ${({ theme }) => theme.colors.dark20};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark22};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.dark20};
  }
`;

export const DeleteButton = styled(BaseButtonStyle)`
  color: ${({ theme }) => theme.colors.dangerBase};
  background-color: ${({ theme }) => theme.colors.dangerSoft};

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerHover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.dangerSoft};
  }
`;

export const WarningButton = styled(BaseButtonStyle)`
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.dark8};
  background-color: ${({ theme }) => theme.colors.warningBase};

  &:hover {
    background-color: ${({ theme }) => theme.colors.warningHover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.warningBase};
  }
`;

export const InfoButton = styled(BaseButtonStyle)`
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme }) => theme.colors.dark8};
  background-color: ${({ theme }) => theme.colors.infoBase};

  &:hover {
    background-color: rgba(72, 183, 244, 1);
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.infoBase};
  }
`;
