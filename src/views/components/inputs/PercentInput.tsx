import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Input } from '.';

const PercentInputContainer = styled.div`
  display: inline-block;
  position: relative;
  & ${Input} {
    padding-right: 37px;
  }

  & span {
    position: absolute;
    right: 16px;
    top: 12px;
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium}
    user-select: none;
  }
`;

type PercentInputProps = InputHTMLAttributes<HTMLInputElement>;

export const PercentInput = forwardRef<HTMLInputElement, PercentInputProps>((props, ref) => (
  <PercentInputContainer>
    <Input {...props} ref={ref} />
    <span>%</span>
  </PercentInputContainer>
));
PercentInput.displayName = 'PercentInput';
