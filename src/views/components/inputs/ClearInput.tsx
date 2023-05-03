import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Input } from '.';
import { ReactComponent as ClearIcon } from '@assets/icons/global/clear-tag-icon.svg';

const ClearInputContainer = styled.div`
  display: inline-block;
  position: relative;

  ${Input} {
    width: 100%;
  }

  & svg {
    position: absolute;
    right: 16px;
    top: 12px;
    color: ${({ theme }) => theme.colors.text500};
    visibility: hidden;

    &:hover {
      cursor: pointer;
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  &:hover {
    & svg {
      visibility: visible;
    }
    ${Input} {
      padding: 9.5px 40px 9.5px 15px;
    }
  }
`;

type ClearInputProps = InputHTMLAttributes<HTMLInputElement> & {
  onClear: () => void;
};

export const ClearInput = forwardRef<HTMLInputElement, ClearInputProps>((props, ref) => {
  const { onClear, ...inputProps } = props;
  return (
    <ClearInputContainer>
      <Input {...inputProps} ref={ref} />
      <ClearIcon onClick={onClear} />
    </ClearInputContainer>
  );
});
ClearInput.displayName = 'ClearInput';
