import React from 'react';
import { useTranslation } from 'react-i18next';
import { EventCommandCategory } from './EventCommandCategory';

export type StudioEventCommandCategory = 'messages' | 'player_interaction' | 'flow_control' | 'game_interfaces';

type EventCommandsCategoryProps = {
  setSelectedCommandCategory: (commandCategory: StudioEventCommandCategory) => void;
};

export const EventCommandCategories = ({ setSelectedCommandCategory }: EventCommandsCategoryProps) => {
  const { t } = useTranslation();

  return (
    <>
      <EventCommandCategory title="Messages" onClick={() => setSelectedCommandCategory('messages')} />
      <EventCommandCategory title="Player Interaction" onClick={() => setSelectedCommandCategory('player_interaction')} />
      <EventCommandCategory title="Flow Control" onClick={() => setSelectedCommandCategory('flow_control')} />
      <EventCommandCategory title="Game Interfaces" onClick={() => setSelectedCommandCategory('game_interfaces')} />
    </>
  );
};
