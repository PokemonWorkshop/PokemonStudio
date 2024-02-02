import React from 'react';
import styled from 'styled-components';

/* eslint-disable react/require-default-props */
type DataFieldgroupFieldProps = {
  label: string;
  data: string | number;
};

const Fieldgroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 167px;
`;

const FieldLabel = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text400};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FieldData = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colors.text100};
  user-select: text;
`;

export const DataFieldgroupField = ({ label, data }: DataFieldgroupFieldProps) => (
  <Fieldgroup>
    <FieldLabel>{label}</FieldLabel>
    <FieldData>{data}</FieldData>
  </Fieldgroup>
);
