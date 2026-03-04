import { useEventContext } from '@components/event/EventContext';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import { useTranslation } from 'react-i18next';
import { EventDialogsRef } from './EventEditorOverlay';
import { EventIcon, IconsFromCommand } from '@components/event/EventIcon';
import { Handle, Position } from '@xyflow/react';
import { useHandleConnectionState } from './useHandleConnectionState';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

const CommandNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 2px 2px 0px;
  width: 320px;
  isolation: isolate;
  border-radius: 16px;
  background-color: #25262a;
  background: linear-gradient(180deg, #1a294e 0%, #25262a 60px);

  &[data-selected='true'] {
    outline: 1px solid #2b4c9f;
  }

  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 10px;
    gap: 8px;

    .title {
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    padding: 0px 4px 4px;
    gap: 8px; // sur figma il n'y a pas de gap mais des padding
  }

  footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px 6px;
    gap: 8px;

    .status {
    }

    .actions {
    }
  }

  .container {
    padding: 1px;
    &[data-selected='false'] {
      background: linear-gradient(180deg, #2b4c9f 0%, #25262a 60px);
    }
    border-radius: 14px;
  }

  .content {
    background-color: #1c1d20;
    box-shadow:
      0px 3px 1px -2px rgba(0, 0, 0, 0.06),
      0px 2px 3px rgba(0, 0, 0, 0.05),
      0px 8px 12px -4px rgba(0, 0, 0, 0.06),
      0px 12px 16px -6px rgba(0, 0, 0, 0.04),
      0px 0px 0px 1px rgba(202, 211, 241, 0.13);
    border-radius: 13px;
  }
`;

type CustomHandleContainerProps = {
  position: 'left' | 'right';
};

const CustomHandleContainer = styled.div<CustomHandleContainerProps>`
  position: absolute;
  width: 8px;
  height: 8px;
  top: 16px;
  left: ${({ position }) => (position === 'left' ? '-9px' : '321px')};

  .icon {
    position: relative;
    display: none;
    color: ${({ theme }) => theme.colors.text400};
    pointer-events: none;

    svg {
      width: 10px;
      height: 10px;
    }
  }

  .point {
    position: relative;
    display: none;
    background-color: ${({ theme }) => theme.colors.text400};
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
    cursor: pointer;
  }

  &[data-connected='true'] {
    .react-flow__handle {
      display: flex;
      background: none;
      width: 8px;
      height: 8px;
      border: 1px solid #383a40;
      box-shadow: none;
      align-items: center;
      justify-content: center;

      .point {
        display: block;
        width: 6px;
        height: 6px;
      }
    }

    .react-flow__handle.connectionindicator:hover {
      display: flex;
      box-sizing: unset;
      background: none;
      width: 8px;
      height: 8px;
      border: 2px solid #383a40;
      box-shadow: none;
      align-items: center;
      justify-content: center;

      .point {
        display: block;
        width: 6px;
        height: 6px;
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
    box-shadow: 0 -1px 0 0 #2b4c9f; // TODO: color should be dynamic
    border-radius: 100%;

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
    border: 2px solid #2b4c9f; // TODO: color should be dynamic

    .point {
      background-color: #2b4c9f; // TODO: color should be dynamic
    }
  }
`;

type CommandNodeProps = {
  commandType: StudioEventCommandType;
  commentCount: number;
  dialogsRef?: EventDialogsRef;
  hasError: boolean;
  nodeId: string;
  selected?: boolean;
  children: ReactNode;
};

export const CommandNode = ({ commandType, commentCount, dialogsRef, hasError, nodeId, selected, children }: CommandNodeProps) => {
  const { setCurrentEditedNode } = useEventContext();
  const { handleLeftIsConnected, handleRightIsConnected } = useHandleConnectionState(nodeId);
  const { t } = useTranslation();
  const deployFooter = hasError || commentCount > 0;
  const color = IconsFromCommand[commandType].color;

  return (
    <>
      <CustomHandleContainer position="left" data-color={color} data-connected={handleLeftIsConnected}>
        <Handle type="target" position={Position.Left} id="Tleft_default" isConnectable={!handleLeftIsConnected}>
          <span className="icon">
            <PlusIcon />
          </span>
          <span className="point" />
        </Handle>
      </CustomHandleContainer>
      <CustomHandleContainer position="right" data-color={color} data-connected={handleRightIsConnected}>
        <Handle type="source" position={Position.Right} id="Sright_default" isConnectable={!handleRightIsConnected}>
          <span className="icon">
            <PlusIcon />
          </span>
          <span className="point" />
        </Handle>
      </CustomHandleContainer>
      <CommandNodeContainer
        data-color={color}
        data-selected={selected}
        onDoubleClick={() => {
          setCurrentEditedNode(nodeId);
          dialogsRef?.current?.openDialog(commandType);
        }}
      >
        <div className="container" data-selected={selected}>
          <div className="content">
            <header>
              <EventIcon icon={{ type: 'command', command: commandType }} />
              <span className="title">{t(`event_command_${commandType}`)}</span>
            </header>
            <div className="body">{children}</div>
          </div>
        </div>
        <footer style={{ height: deployFooter ? '24px' : '8px' }}>
          {hasError && <span className="status">Données invalides</span>}
          {commentCount > 0 && <span className="actions">{commentCount}</span>}
        </footer>
      </CommandNodeContainer>
    </>
  );
};
