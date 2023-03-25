import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Input } from '.';

const CoordinateInputContainer = styled.div`
  display: flex;
  position: relative;
  & ${Input} {
    width: 100%;
    padding-left: 37px;
  }

  & span {
    position: absolute;
    left: 16px;
    top: 11px;
    color: ${({ theme }) => theme.colors.text400};
    ${({ theme }) => theme.fonts.normalMedium}
    user-select: none;
  }
`;

type CoordinateInputProps = {
  unit?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const CoordinateInput = ({ unit, ...props }: CoordinateInputProps) => (
  <CoordinateInputContainer>
    <Input {...props} />
    <span>{unit ?? 'x'}</span>
  </CoordinateInputContainer>
);
