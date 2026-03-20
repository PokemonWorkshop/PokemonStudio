import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import styled from 'styled-components';
import { Input } from '.';
import ClearIcon from '@assets/icons/global/clear-tag-icon.svg';

export const ClearInputContainer = styled.div`
  display: inline-block;
  position: relative;

  ${Input} {
    width: 100%;
  }

  & svg {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translate(-50%, -50%);
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

export const useClearInput = (props: ClearInputProps, ref: React.ForwardedRef<HTMLInputElement>) => {
  const { onClear, ...inputProps } = props;
  const [isIconShown, setIsIconShown] = useState(props.value === undefined ? !!props.defaultValue : !!props.value);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(event);
    }
    setIsIconShown(event.target.value !== '');
  };

  const handleClear = () => {
    onClear();
    setIsIconShown(false);
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.value = '';
    }
  };

  return {
    inputProps,
    isIconShown,
    onChange,
    handleClear,
  };
};

export type ClearInputProps = InputHTMLAttributes<HTMLInputElement> & {
  onClear: () => void;
};

export const ClearInput = forwardRef<HTMLInputElement, ClearInputProps>((props, ref) => {
  const { inputProps, isIconShown, onChange, handleClear } = useClearInput(props, ref);
  return (
    <ClearInputContainer>
      <Input {...inputProps} ref={ref} onChange={onChange} />
      {isIconShown && <ClearIcon onClick={handleClear} />}
    </ClearInputContainer>
  );
});
ClearInput.displayName = 'ClearInput';
