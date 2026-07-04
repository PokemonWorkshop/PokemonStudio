import NoteIcon from '@assets/icons/global/note.svg';
import InfoIcon from '@assets/icons/notification/info.svg';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer } from '@components/inputs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { CustomHandle } from '@components/world/event/common/CustomHandle';
import { useEventActions } from '@components/world/event/common/EventContext';
import { EventIcon, EventIconColor, IconsFromCommand } from '@components/world/event/common/EventIcon';
import { useHandleConnectionState } from '@components/world/event/hooks/useHandleConnectionState';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import { Position } from '@xyflow/react';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CommandDialogsRef } from '../commands/editors/CommandEditorOverlay';

const CommandNodeContainer = styled.div<{ color: EventIconColor }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 2px 2px 0px;
  width: 320px;
  isolation: isolate;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    ${({ theme, color }) => theme.colors[`${color}6`]} 0%,
    ${({ theme, color }) => theme.colors[`${color}6`]} 32px,
    #25262a 56px
  );
  ${({ theme }) => theme.fonts.normalMedium}
  color: #b4b7c1;

  &[data-selected='true'] {
    outline: 1px solid ${({ theme, color }) => theme.colors[`${color}9`]};
  }

  .react-flow__node:focus-visible & {
    outline: 1px solid ${({ theme, color }) => theme.colors[`${color}9`]};
  }

  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 10px;
    height: 40px;
    gap: 8px;

    .title {
      color: ${({ theme }) => theme.colors.text100};
    }
  }

  .body {
    display: flex;
    flex-direction: column;
    padding: 0px 4px 4px 4px;

    ${InputFormContainer} {
      gap: 0;
    }

    ${InputWithTopLabelContainer},
    ${InputWithLeftLabelContainer} {
      padding: 6px;
    }
  }

  footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px 6px;
    gap: 8px;

    .badge {
      padding-left: 2px;
    }

    .status {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 0px 4px;
      height: 20px;
      gap: 2px;

      background-color: #33181f;
      border: 0.5px solid #4f1d28;
      border-radius: 4px;

      .label {
        color: #f25c71;
      }

      .icon {
        color: #d43f56;
        width: 16px;
        height: 16px;
      }
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      height: 24px;

      .comments {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0px 6px;
        gap: 2px;
        border-radius: 8px;

        &:hover {
          cursor: pointer;
        }

        .icon {
          color: #6c707b;
        }

        .count {
          color: #b4b7c1;
        }
      }
    }
  }

  .container {
    padding: 1px;
    &[data-selected='false'] {
      background: linear-gradient(
        180deg,
        ${({ theme, color }) => theme.colors[`${color}9`]} 0%,
        ${({ theme, color }) => theme.colors[`${color}9`]} 32px,
        #25262a 56px
      );
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

type CommandNodeProps = {
  commandType: StudioEventCommandType;
  commentCount: number;
  dialogsRef?: CommandDialogsRef;
  hasError?: boolean;
  nodeId: string;
  selected?: boolean;
  children: ReactNode;
  outputCount?: number;
};

export const CommandNode = ({ commandType, commentCount, dialogsRef, hasError, nodeId, selected, children, outputCount }: CommandNodeProps) => {
  const { setCurrentEditedNode } = useEventActions();
  const { isHandleConnected } = useHandleConnectionState(nodeId);
  const { t } = useTranslation();
  const deployFooter = hasError || commentCount > 0;
  const color = IconsFromCommand[commandType].color;
  const handleLeftIsConnected = isHandleConnected('Tleft_default', 'target');
  const handleRightIsConnected = isHandleConnected('Sright_default', 'source');
  const hasMultipleOutputs = outputCount !== undefined && outputCount > 1;

  return (
    <>
      <CustomHandle
        color={color}
        handleIsConnected={handleLeftIsConnected}
        id="Tleft_default"
        position={Position.Left}
        type="target"
        multiHandle={false}
      />
      {hasMultipleOutputs ? (
        Array.from({ length: outputCount }, (_, i) => {
          const handleId = `Sright_${i}`;
          return (
            <CustomHandle
              key={handleId}
              color={color}
              handleIsConnected={isHandleConnected(handleId, 'source')}
              id={handleId}
              position={Position.Right}
              type="source"
              multiHandle={true}
              index={i}
            />
          );
        })
      ) : (
        <CustomHandle
          color={color}
          handleIsConnected={handleRightIsConnected}
          id="Sright_default"
          position={Position.Right}
          type="source"
          multiHandle={false}
        />
      )}
      <CommandNodeContainer
        color={color}
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
          {hasError ? (
            <div className="badge">
              <div className="status">
                <InfoIcon className="icon" />
                <span className="label">{t('invalid_data')}</span>
              </div>
            </div>
          ) : (
            <div />
          )}
          <div className="actions">
            {commentCount > 0 && (
              <div className="comments nodrag" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                <NoteIcon className="icon" />
                <span className="count">{commentCount}</span>
              </div>
            )}
          </div>
        </footer>
      </CommandNodeContainer>
    </>
  );
};
