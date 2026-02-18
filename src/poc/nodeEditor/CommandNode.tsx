import { useEventContext } from '@components/event/EventContext';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EventDialogsRef } from './EventEditorOverlay';
import { EventIcon, IconsFromCommand } from '@components/event/EventIcon';
import { Handle, Position } from '@xyflow/react';

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

  .icon {
    display: none;
  }

  .react-flow__handle {
    background: #202225;
    border: 1px solid #383a40;
    box-shadow: 0px 0px 0px 2px #181819;
    border-radius: 100%;
    left: ${({ position }) => (position === 'left' ? '-9px' : '320px')};
    cursor: pointer;

    &:hover {
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      left: ${({ position }) => (position === 'left' ? '-11px' : '313px')};

      background: #202245;
      border: 1px solid #31327a;
      box-shadow: none;
      border-radius: 100%;

      .icon {
        display: block;
      }
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
  const { t } = useTranslation();
  const deployFooter = hasError || commentCount > 0;
  const color = IconsFromCommand[commandType].color;

  return (
    <>
      <CustomHandleContainer position="left" data-color={color}>
        <Handle type="target" position={Position.Left} id="Tleft_default" />
      </CustomHandleContainer>
      <CustomHandleContainer position="right" data-color={color}>
        <Handle type="source" position={Position.Right} id="Sright_default" />
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
