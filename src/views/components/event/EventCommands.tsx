import BackIcon from '@assets/icons/global/back.svg';
import { EventCommand } from './EventCommand';
import type { StudioEventCommandCategory } from './EventCommandCategories';
import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EventCommandsContainer = styled.div`
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

type EventCommandsProps = {
  category: StudioEventCommandCategory;
  setSelectedCommandCategory: (category: StudioEventCommandCategory | undefined) => void;
  research?: string;
};

/*const CommandsFromCategory: Record<StudioEventCommandCategory, React.JSX.Element> = {
  flow_control: (
    <>
      <EventCommand title="Call an Event" />
      <EventCommand title="Add a Condition" />
      <EventCommand title="Insert a Loop" />
      <EventCommand title="Stop Event Execution" />
      <EventCommand title="Add a Jump to another command" />
    </>
  ),
  game_interfaces: <></>,
  messages: (
    <>
      <EventCommand title="Show a message" />
    </>
  ),
  player_interaction: <></>,
};*/

// TODO: change string[] to better type
const CommandsFromCategory: Record<StudioEventCommandCategory, string[]> = {
  flow_control: ['call_event', 'add_condition', 'insert_loop', 'stop_event_execution', 'add_jump_other_command'],
  game_interfaces: [],
  messages: ['show_message'],
  player_interaction: [],
};

export const EventCommands = ({ category, setSelectedCommandCategory, research }: EventCommandsProps) => {
  const { t } = useTranslation();
  const [commandsCount, setCommandsCount] = useState<number | undefined>(undefined);
  const commandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commandsRef.current) return;

    setCommandsCount(commandsRef.current.childElementCount);
  }, []);

  return (
    <EventCommandsContainer>
      <div className="category-header">
        <span className="back-icon" onClick={() => setSelectedCommandCategory(undefined)}>
          <BackIcon />
        </span>
        <h2>{t(category)}</h2>
        <span className="count">{commandsCount}</span>
      </div>
      <div className="commands" ref={commandsRef}>
        {CommandsFromCategory[category].map((command) => (
          <EventCommand key={command} title={t(`event_command_${command}`)} />
        ))}
      </div>
    </EventCommandsContainer>
  );
};
