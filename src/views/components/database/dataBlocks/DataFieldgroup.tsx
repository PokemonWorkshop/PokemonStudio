import React, { ReactNode } from 'react';
import styled from 'styled-components';

type DataFieldgroupProps = {
  // eslint-disable-next-line react/require-default-props
  title?: string;
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
  data?: number;
};

const DataFieldgroupStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .title-row {
    display: flex;
    justify-content: space-between;

    h3 {
      color: ${(props) => props.theme.colors.text400};
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    span {
      color: ${(props) => props.theme.colors.text100};
      font-size: 14px;
      margin: 0 28px 0 0;
    }
  }
`;

export const DataFieldgroup = ({ title, children, data }: DataFieldgroupProps) => (
  <DataFieldgroupStyle>
    {title && (
      <div className="title-row">
        <h3>{title}</h3>
        {data && <span>{data}</span>}
      </div>
    )}
    {children}
  </DataFieldgroupStyle>
);
