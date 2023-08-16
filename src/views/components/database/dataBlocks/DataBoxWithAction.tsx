import { ToolTip, ToolTipContainerForButton } from '@components/Tooltip';
import React from 'react';
import styled from 'styled-components';
import { DataBlockWithTitleProps, DataBlockWithTitleStyle } from './DataBlockWithTitle';

type DataBlockWithActionTooltipProps = {
  tooltipMessage: string;
} & DataBlockWithTitleProps;

const DataBoxWithActionStyle = styled(DataBlockWithTitleStyle)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin-bottom: 0;
  }
`;

export const DataBlockWithAction = ({ title, size, children, disabled }: DataBlockWithTitleProps) => (
  <DataBoxWithActionStyle size={size} data-noactive data-disabled={disabled}>
    <h2>{title}</h2>
    {children}
  </DataBoxWithActionStyle>
);

export const DataBlockWithActionTooltip = ({ title, size, children, disabled, tooltipMessage }: DataBlockWithActionTooltipProps) => (
  <DataBoxWithActionStyle size={size} data-noactive data-disabled={disabled}>
    <h2>{title}</h2>
    <ToolTipContainerForButton>
      {tooltipMessage && <ToolTip top="100%">{tooltipMessage}</ToolTip>}
      {children}
    </ToolTipContainerForButton>
  </DataBoxWithActionStyle>
);
