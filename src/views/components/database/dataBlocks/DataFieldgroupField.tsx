import React from 'react';
import styled from 'styled-components';

type DataFieldgroupFieldProps = {
  label: string;
  data: string | number;
  width?: string;
};

type FieldgroupProps = {
  width?: string;
};

const Fieldgroup = styled.div<FieldgroupProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: ${({ width }) => width ?? '167px'};
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

export const DataFieldgroupField = ({ label, data, width }: DataFieldgroupFieldProps) => (
  <Fieldgroup width={width}>
    <FieldLabel>{label}</FieldLabel>
    <FieldData>{data}</FieldData>
  </Fieldgroup>
);
