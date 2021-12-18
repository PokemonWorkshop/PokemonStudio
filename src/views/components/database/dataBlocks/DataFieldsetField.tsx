import React, { ReactNode } from 'react';
import styled from 'styled-components';

/* eslint-disable react/require-default-props */
type FieldSize = 's' | 'm';

type FieldsetProps = {
  size?: FieldSize;
};

const sizeToPx: Record<FieldSize, { gap: string }> = {
  s: { gap: '4px' },
  m: { gap: '8px' },
};

type DataFieldsetFieldProps = {
  size?: FieldSize;
  label: string;
  data: string | number;
  disabled?: boolean;
  error?: boolean;
};

type DataFieldsetFieldCodeProps = {
  size?: FieldSize;
  label: string;
  data: string | number;
};

type DataFieldsetFieldWithChildProps = Omit<DataFieldsetFieldProps, 'data' | 'disabled'> & { children: ReactNode };

type FieldDataProps = {
  disabled: boolean;
  error: boolean;
};

const Fieldset = styled.div<FieldsetProps>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => sizeToPx[props.size || 's'].gap};
`;

const FieldLabel = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text400};
`;

const FieldLabelCentered = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text400};
  text-align: center;
`;

export const FieldData = styled.span<FieldDataProps>`
  font-size: 14px;
  color: ${(props) => (props.disabled ? props.theme.colors.text500 : props.error ? props.theme.colors.dangerBase : props.theme.colors.text100)};
  user-select: text;
`;

const FieldCode = styled.span`
  border-radius: 4px;
  padding: 4px 8px;
  ${(props) => props.theme.fonts.codeRegular};
  color: ${(props) => props.theme.colors.text100};
  background-color: ${(props) => props.theme.colors.dark8};
  width: fit-content;
  user-select: text;
`;

export const DataFieldsetField = ({ label, data, size, disabled, error }: DataFieldsetFieldProps) => (
  <Fieldset size={size}>
    <FieldLabel>{label}</FieldLabel>
    <FieldData disabled={disabled || false} error={error || false}>
      {data}
    </FieldData>
  </Fieldset>
);

export const DataFieldsetFieldWithChild = ({ label, children, size }: DataFieldsetFieldWithChildProps) => (
  <Fieldset size={size}>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </Fieldset>
);

export const DataFieldsetFieldCenteredWithChild = ({ label, children, size }: DataFieldsetFieldWithChildProps) => (
  <Fieldset size={size}>
    <FieldLabelCentered>{label}</FieldLabelCentered>
    {children}
  </Fieldset>
);

export const DataFieldsetFieldCode = ({ label, data, size }: DataFieldsetFieldCodeProps) => (
  <Fieldset size={size}>
    <FieldLabel>{label}</FieldLabel>
    <FieldCode>{data}</FieldCode>
  </Fieldset>
);
