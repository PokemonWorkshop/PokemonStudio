import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Input } from '.';

const EmbeddedUnitInputContainer = styled.div`
  display: flex;
  position: relative;
  & ${Input} {
    width: 100%;
    padding-right: 37px;
  }

  & span {
    position: absolute;
    right: 16px;
    top: 11px;
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium}
    user-select: none;
  }
`;

type EmbeddedUnitInputProps = {
  unit?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const EmbeddedUnitInput = forwardRef<HTMLInputElement | null, EmbeddedUnitInputProps>(({ unit, ...props }, inputRef) => (
  <EmbeddedUnitInputContainer>
    <Input {...props} ref={inputRef} />
    <span>{unit ?? '%'}</span>
  </EmbeddedUnitInputContainer>
));
EmbeddedUnitInput.displayName = 'EmbeddedUnitInput';
