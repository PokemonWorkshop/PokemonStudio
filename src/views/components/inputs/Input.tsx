import styled from 'styled-components';
import TextareaAutosize from 'react-textarea-autosize';

type InputProps = {
  error?: boolean;
};

export const Input = styled.input<InputProps>`
  box-sizing: border-box;
  padding: 9.5px 15px;
  margin: 0;
  background-color: ${({ theme }) => theme.colors.dark12};
  border: 1px solid transparent;
  border-radius: 8px;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme, error }) => (error ? theme.colors.dangerBase : theme.colors.text100)};
  text-align: ${(props) => (props.type === 'number' ? 'right' : 'left')};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.dark24};
    outline: 1.5px solid ${({ theme }) => theme.colors.dark24};
  }

  &:disabled {
    cursor: not-allowed;
    filter: opacity(60%);
  }

  &.active,
  &:active:not(:disabled),
  &:focus:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primaryBase};
    outline: 1.5px solid ${({ theme }) => theme.colors.primaryBase};
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text500};
  }

  &[type='color'] {
    width: 100%;
    height: 40px;
    position: relative;
    ::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    ::-webkit-color-swatch {
      border: none;
      height: 0;
      width: 0;
    }
    ::after {
      content: attr(value);
      position: absolute;
      top: 9.5px;
    }
    :hover::after,
    :active::after,
    :focus::after {
      top: 9.5px;
    }
  }

  &:invalid {
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

type MultiLineInputProps = {
  error?: 'true';
};

export const MultiLineInput = styled(TextareaAutosize)<MultiLineInputProps>`
  box-sizing: border-box;
  padding: 9.5px 15px;
  margin: 0;
  background-color: ${({ theme }) => theme.colors.dark12};
  border: 1px solid transparent;
  border-radius: 8px;
  ${({ theme }) => theme.fonts.normalMedium}
  color: ${({ theme, error }) => (error ? theme.colors.dangerBase : theme.colors.text100)};
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.dark24};
    outline: 1.5px solid ${({ theme }) => theme.colors.dark24};
  }

  &.active,
  &:active,
  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryBase};
    outline: 1.5px solid ${({ theme }) => theme.colors.primaryBase};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text500};
  }

  resize: none;
`;

export const TextInputError = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.dangerBase};
  user-select: none;
  padding: 0 16px 0 16px;
`;

export const InputTable = styled(Input)`
  height: 32px;
  padding: 9.5px 11px;
`;
