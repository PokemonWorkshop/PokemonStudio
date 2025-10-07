import BackIcon from '@assets/icons/global/back.svg';
import { EventCommand } from './EventCommand';
import type { StudioEventCommandCategory } from '@modelEntities/event';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import styled from 'styled-components';
import React, { useMemo } from 'react';

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

type EventCommandHelperType = {
  commandType: string; // TODO: change string to better type
  helper?: boolean;
};

type EventCommandsProps = {
  category: StudioEventCommandCategory;
  setSelectedCommandCategory: (category: StudioEventCommandCategory | undefined) => void;
  research?: string;
};

const CommandsFromCategory: Record<StudioEventCommandCategory, EventCommandHelperType[]> = {
  flow_control: [
    { commandType: 'call_event', helper: true },
    { commandType: 'add_condition' },
    { commandType: 'insert_loop' },
    { commandType: 'stop_event_execution' },
    { commandType: 'add_jump_another_command' },
  ],
  game_interfaces: [],
  messages: [{ commandType: 'show_message' }],
  player_interaction: [],
};

const getCommands = (category: StudioEventCommandCategory, t: TFunction, research?: string) => {
  if (!research) return CommandsFromCategory[category];

  return CommandsFromCategory[category]
    .map((command) => ({ command, title: t(`event_command_${command.commandType}`) }))
    .filter(({ title }) => title.toLowerCase().startsWith(research))
    .map(({ command }) => command);
};

export const EventCommands = ({ category, setSelectedCommandCategory, research }: EventCommandsProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commands = useMemo(() => getCommands(category, t, research), [category, research]);
  const commandsCount = commands.length;

  return research && commandsCount === 0 ? (
    <></>
  ) : (
    <EventCommandsContainer>
      <div className="category-header">
        {!research && (
          <span className="back-icon" onClick={() => setSelectedCommandCategory(undefined)}>
            <BackIcon />
          </span>
        )}
        <h2>{t(`event_category_${category}`)}</h2>
        <span className="count">{commandsCount}</span>
      </div>
      <div className="commands">
        {commands.map(({ commandType, helper }) => (
          <EventCommand key={commandType} command={commandType} hasHelper={helper} />
        ))}
      </div>
    </EventCommandsContainer>
  );
};
