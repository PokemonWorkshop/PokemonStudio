import PlusIcon from '@assets/icons/global/plus-icon.svg';
import { Handle, HandleType, Position } from '@xyflow/react';
import React from 'react';
import styled from 'styled-components';
import { EventIconColor } from './EventIcon';

type CustomHandleContainerProps = {
  position: Position;
  color: EventIconColor;
  multiHandle: boolean;
  index?: number;
};

const CustomHandleContainer = styled.div<CustomHandleContainerProps>`
  position: absolute;
  width: 10px;
  height: 10px;
  left: ${({ position }) => (position === 'left' ? '-9px' : '319px')};

  ${({ multiHandle, index = 0 }) => (multiHandle ? `bottom: ${24 + 32 * index}px;` : `top: 16px;`)}

  .icon {
    position: relative;
    display: none;
    color: #6c707b;
    pointer-events: none;
    top: -1px;

    svg {
      width: 8px;
      height: 8px;
    }
  }

  .point {
    position: relative;
    display: none;
    background-color: #6c707b;
    pointer-events: none;
    border-radius: 100%;
    width: 8px;
    height: 8px;
  }

  .react-flow__handle {
    background: #202225;
    border: 1px solid #383a40;
    box-shadow: 0px 0px 0px 2px #181819;
    border-radius: 100%;
    width: 8px;
    height: 8px;
    cursor: pointer;
  }

  &[data-connected='true'] {
    .react-flow__handle {
      display: flex;
      background: none;
      width: 10px;
      height: 10px;
      border: 1px solid #383a40;
      box-shadow: none;
      align-items: center;
      justify-content: center;

      .point {
        display: block;
        width: 8px;
        height: 8px;
        background-color: #4f525b;
      }
    }

    .react-flow__handle.connectionindicator:hover {
      display: flex;
      box-sizing: unset;
      background: none;
      width: 10px;
      height: 10px;
      border: 2px solid #383a40;
      box-shadow: none;
      align-items: center;
      justify-content: center;

      .point {
        display: block;
        width: 8px;
        height: 8px;
      }

      .icon {
        display: none;
      }
    }
  }

  .react-flow__handle.connectionindicator:hover {
    display: flex;
    box-sizing: border-box;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;

    background: #202225;
    border: 1px solid #383a40;
    border-radius: 100%;
    box-shadow: none;

    .icon {
      display: block;
    }
  }

  .react-flow__handle.connectingfrom,
  .react-flow__handle.connectingto {
    display: flex;
    background: none;
    width: 12px;
    height: 12px;
    border: 2px solid #383a40;
    box-shadow: none;
    align-items: center;
    justify-content: center;

    .point {
      display: block;
    }
  }

  .react-flow__handle.connectingto {
    cursor: not-allowed;
  }

  .react-flow__handle.valid {
    cursor: grabbing;
  }

  .react-flow__handle.connectingfrom.connectionindicator:hover,
  .react-flow__handle.connectingto.connectionindicator:hover {
    background: inherit;
    box-shadow: none;

    .icon {
      display: none;
    }
  }

  .react-flow__handle.connectingfrom.connectionindicator:hover {
    border: 2px solid #383a40;
  }

  .react-flow__handle.connectingto.connectionindicator {
    border: 2px solid ${({ theme, color }) => theme.colors[`${color}9`]};

    .point {
      background-color: ${({ theme, color }) => theme.colors[`${color}9`]};
    }
  }
`;

type CustomHandleProps = {
  color: EventIconColor;
  handleIsConnected: boolean;
  position: Position;
  type: HandleType;
  id?: string | null | undefined;
  hasUnlimitedConnection?: boolean;
  style?: React.CSSProperties;
  multiHandle: boolean;
  index?: number;
};

export const CustomHandle = ({ color, handleIsConnected, id, position, type, style, multiHandle, index }: CustomHandleProps) => {
  return (
    <CustomHandleContainer position={position} color={color} data-connected={handleIsConnected} style={style} multiHandle={multiHandle} index={index}>
      <Handle type={type} position={position} id={id} isConnectable={position == Position.Left || !handleIsConnected}>
        <span className="icon">
          <PlusIcon />
        </span>
        <span className="point" />
      </Handle>
    </CustomHandleContainer>
  );
};
