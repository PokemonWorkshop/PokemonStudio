import React, { InputHTMLAttributes } from 'react';
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

export const PercentInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <PercentInputContainer>
    <Input {...props} />
    <span>%</span>
  </PercentInputContainer>
);
