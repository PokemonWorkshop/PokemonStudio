import { useEventContext } from '@components/event/EventContext';
import type { StudioEventCommandType } from '@modelEntities/event/command';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EventDialogsRef } from './EventEditorOverlay';
import { IconsFromCommand } from '@components/event/EventCommandIcon';

const CommandNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  padding: 2px 2px 0px;
  isolation: isolate;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(26, 41, 78, 1) 0%, rgba(37, 38, 42, 1) 48px);

  &[data-selected='true'] {
    border: 2px solid red;
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
    background: linear-gradient(180deg, rgba(43, 76, 159, 1) 0%, rgba(37, 38, 42, 1) 48px);
    //background: linear-gradient(180deg, rgba(255, 76, 159, 1) 0%, rgba(255, 38, 42, 1) 48px);
    border-radius: 14px 14px 0px 0px;
  }

  .content {
    background-color: #1c1d20;
    /* Shadow/M-BorderSubtle */
    box-shadow:
      0px 3px 1px -2px rgba(0, 0, 0, 0.06),
      0px 2px 3px rgba(0, 0, 0, 0.05),
      0px 8px 12px -4px rgba(0, 0, 0, 0.06),
      0px 12px 16px -6px rgba(0, 0, 0, 0.04),
      0px 0px 0px 1px rgba(202, 211, 241, 0.13);
    border-radius: 13px;

    /*border-width: 1px 1px 0px 1px;
    border-style: solid;
    border-color: #2b4c9f;
    border-radius: 14px 14px 0px 0px;*/

    //background: linear-gradient(180deg, #2b4c9f, 0%, rgba(26, 41, 78, 1), 80%);
    //border-image: linear-gradient(180deg, rgba(43, 76, 159, 1) 0%, rgba(37, 38, 42, 1) 48px);

    /*border-style: solid;
    border-image: linear-gradient(180deg, rgba(43, 76, 159, 1) 0%, rgba(37, 38, 42, 1) 48px);*/
    /*border: 4px solid;
    border-image: linear-gradient(45deg, #ff6a00, #ee0979) 1;
    border-radius: 16px;*/
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

  return (
    <CommandNodeContainer
      color={undefined}
      data-selected={selected}
      onDoubleClick={() => {
        setCurrentEditedNode(nodeId);
        dialogsRef?.current?.openDialog(commandType);
      }}
    >
      <div className="container">
        <div className="content">
          <header>
            {IconsFromCommand[commandType]}
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
  );
};
