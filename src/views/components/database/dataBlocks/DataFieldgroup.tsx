import React, { ReactNode } from 'react';
import styled from 'styled-components';

type DataFieldgroupProps = {
  // eslint-disable-next-line react/require-default-props
  title?: string;
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
};

const DataFieldgroupStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    color: ${(props) => props.theme.colors.text400};
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px 0;
  }
`;

export const DataFieldgroup = ({ title, children }: DataFieldgroupProps) => (
  <DataFieldgroupStyle>
    {title && <h3>{title}</h3>}
    {children}
  </DataFieldgroupStyle>
);
