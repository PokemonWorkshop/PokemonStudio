import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';
import { Input } from '.';

type EmbeddedUnitInputContainerProps = { offsetUnit?: string };

const EmbeddedUnitInputContainer = styled.div<EmbeddedUnitInputContainerProps>`
  display: flex;
  position: relative;
  & ${Input} {
    width: 100%;
    padding-right: ${({ offsetUnit }) => offsetUnit ?? '37px'};
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
  offsetUnit?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const EmbeddedUnitInput = forwardRef<HTMLInputElement | null, EmbeddedUnitInputProps>(({ unit, offsetUnit, ...props }, inputRef) => (
  <EmbeddedUnitInputContainer offsetUnit={offsetUnit}>
    <Input {...props} ref={inputRef} />
    <span>{unit ?? '%'}</span>
  </EmbeddedUnitInputContainer>
));
EmbeddedUnitInput.displayName = 'EmbeddedUnitInput';
