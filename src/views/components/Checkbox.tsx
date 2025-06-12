import React, { InputHTMLAttributes, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';
import { ReactComponent as DoneIcon } from '@assets/icons/global/done.svg';

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  border: 2px solid ${({ theme }) => theme.colors.dark24};
  margin: 0;

  :hover {
    cursor: pointer;
  }

  &:checked {
    background-color: ${({ theme }) => theme.colors.primaryBase};
    border: none;

    &:disabled {
      background-color: ${({ theme }) => theme.colors.dark24};
      border: none;
    }
  }

  &:disabled {
    border: 2px solid ${({ theme }) => theme.colors.dark20};
  }

  &:indeterminate {
    background-color: ${({ theme }) => theme.colors.primaryBase};
    border-color: ${({ theme }) => theme.colors.dark24};
    border: none;
  }
  &:indeterminate::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.text100};
    transform: translate(-50%, -50%);
  }
`;

const CheckboxContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;

  .icon {
    position: absolute;
    top: 0;
    height: 18px;
    color: ${({ theme }) => theme.colors.text100};
    pointer-events: none;
    visibility: hidden;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  ${CheckboxInput}:checked + .icon {
    visibility: visible;
  }

  ${CheckboxInput}:indeterminate + .icon {
    visibility: hidden;
  }

  ${CheckboxInput}:disabled + .icon {
    color: ${({ theme }) => theme.colors.text500};
  }
`;

type CheckboxType = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  indeterminate?: boolean;
};
export const Checkbox = forwardRef<HTMLInputElement, CheckboxType>(({ className, indeterminate, ...props }, ref) => {
  const localRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localRef.current) {
      if (localRef.current.checked) {
        localRef.current.indeterminate = false;
      } else {
        localRef.current.indeterminate = !!indeterminate;
      }
    }
  }, [indeterminate]);

  return (
    <CheckboxContainer className={className}>
      <CheckboxInput {...props} ref={localRef} />
      <div className="icon">
        <DoneIcon />
      </div>
    </CheckboxContainer>
  );
});

Checkbox.displayName = 'Checkbox';
