import React, { LabelHTMLAttributes } from 'react';
import styled from 'styled-components';

const LabelContainer = styled.label`
  display: flex;
  flex-direction: row;
  gap: 4px;
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text100};
  margin: 0;
  padding: 0;
  user-select: none;

  & span {
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

type LabelProps = {
  required?: boolean;
} & LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ required, children, ...props }: LabelProps) => {
  return (
    <LabelContainer {...props}>
      {children}
      {required && <span>*</span>}
    </LabelContainer>
  );
};
