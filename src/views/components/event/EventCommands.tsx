import { EventCommand } from './EventCommand';
import type { StudioEventCommandCategory } from './EventCommandCategories';
import React from 'react';

type EventCommandsProps = {
  category: StudioEventCommandCategory;
};

const CommandsFromCategory: Record<StudioEventCommandCategory, React.JSX.Element> = {
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
};

export const EventCommands = ({ category }: EventCommandsProps) => {
  return CommandsFromCategory[category];
};
