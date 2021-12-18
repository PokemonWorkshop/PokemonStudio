import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Input } from '.';

const EmbeddedUnitInputContainer = styled.div`
  display: flex;
  position: relative;
  & ${Input} {
    width: 100%;
    padding-right: 37px;
    :hover,
    :active,
    :focus {
      padding-right: 36px;
    }
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

export const EmbeddedUnitInput = ({ unit, ...props }: EmbeddedUnitInputProps) => (
  <EmbeddedUnitInputContainer>
    <Input {...props} />
    <span>{unit ?? '%'}</span>
  </EmbeddedUnitInputContainer>
);
