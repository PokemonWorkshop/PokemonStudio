import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ClearInput } from '../inputs';
import { EventCommandCategories, type StudioEventCommandCategory } from './EventCommandCategories';
import { t } from 'i18next';
import BackIcon from '@assets/icons/global/back.svg';
import { EventCommands } from './EventCommands';

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
    grid-template-columns: 1fr 1fr;
    grid-gap: 8px;
    padding: 8px 12px 8px 12px;
  }

  .category-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px 12px;
    gap: 4px;
    box-sizing: border-box;
    background: linear-gradient(180deg, rgb(39, 27, 53) 0%, rgba(39, 27, 53, 0) 50%);
    align-items: center;

    .back-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 24px;
      width: 24px;
      color: ${({ theme }) => theme.colors.text400};

      & svg {
        height: 12px;
        width: 12px;
      }
    }

    h2 {
      margin: 0;
      color: ${({ theme }) => theme.colors.text100} !important;
    }

    .count {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 0px 4px;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      border: 1px solid rgb(46, 48, 54);
      border-radius: 4px;

      ${({ theme }) => theme.fonts.normalMedium}
    }
  }
`;

export const EventCommandsEditor = () => {
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<StudioEventCommandCategory | undefined>(undefined);
  const [commandsCount, setCommandsCount] = useState<number | undefined>(undefined);
  const commandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commandsRef.current) return;

    setCommandsCount(commandsRef.current.childElementCount);
  }, [selectedCommandCategory]);

  return (
    <EventCommandsEditorContainer>
      <div className="head">
        <div className="title">
          <h2>Instructions</h2>
          <span>Icon</span>
        </div>
        <ClearInput onClear={() => undefined} placeholder="Search..." />
      </div>
      {selectedCommandCategory ? (
        <>
          <div className="category-header">
            <span className="back-icon" onClick={() => setSelectedCommandCategory(undefined)}>
              <BackIcon />
            </span>
            <h2>{t(selectedCommandCategory)}</h2>
            <span className="count">{commandsCount}</span>
          </div>
          <div className="commands" ref={commandsRef}>
            <EventCommands category={selectedCommandCategory} />
          </div>
        </>
      ) : (
        <div className="commands">
          <EventCommandCategories setSelectedCommandCategory={setSelectedCommandCategory} />
        </div>
      )}
    </EventCommandsEditorContainer>
  );
};
