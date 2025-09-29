import React from 'react';
import styled from 'styled-components';
import { ClearInput } from '../inputs';
import { EventCommand } from './EventCommand';

const EventCommandsEditorContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 240px;
  height: 100%;
  background-color: rgb(23, 24, 26);
  border-left: 1px solid rgb(46, 48, 54);
  overflow-y: auto;

  .head {
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 8px;

    .title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 24px;

      h2 {
        margin: 0;
        color: ${({ theme }) => theme.colors.text100} !important;
      }
    }
  }

  .commands {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 8px;
    padding: 8px 12px 8px 12px;
  }
`;

export const EventCommandsEditor = () => {
  return (
    <EventCommandsEditorContainer>
      <div className="head">
        <div className="title">
          <h2>Instructions</h2>
          <span>Icon</span>
        </div>
        <ClearInput onClear={() => undefined} placeholder="Search..." />
      </div>
      <div className="commands">
        <EventCommand title="Messages" />
        <EventCommand title="Player Interaction" />
        <EventCommand title="Flow Control" />
        <EventCommand title="Game Interfaces" />
      </div>
    </EventCommandsEditorContainer>
  );
};
