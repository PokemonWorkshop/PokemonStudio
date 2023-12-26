import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { ReactComponent as DoneIcon } from '@assets/icons/global/done.svg';

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 2px;
  border: 2px solid ${({ theme }) => theme.colors.dark24};
  margin: 0;

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

  ${CheckboxInput}:disabled + .icon {
    color: ${({ theme }) => theme.colors.text500};
  }
`;

type CheckboxType = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = ({ className, ...props }: CheckboxType) => (
  <CheckboxContainer className={className}>
    <CheckboxInput {...props} />
    <div className="icon">
      <DoneIcon />
    </div>
  </CheckboxContainer>
);
