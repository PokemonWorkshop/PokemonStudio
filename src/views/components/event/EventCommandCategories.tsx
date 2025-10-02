import React from 'react';
import { useTranslation } from 'react-i18next';
import { EventCommandCategory } from './EventCommandCategory';

export const STUDIO_EVENT_COMMAND_CATEGORY_LIST = ['messages', 'player_interaction', 'flow_control', 'game_interfaces'] as const;
export type StudioEventCommandCategory = (typeof STUDIO_EVENT_COMMAND_CATEGORY_LIST)[number];

type EventCommandsCategoryProps = {
  setSelectedCommandCategory: (commandCategory: StudioEventCommandCategory) => void;
};

export const EventCommandCategories = ({ setSelectedCommandCategory }: EventCommandsCategoryProps) => {
  const { t } = useTranslation();

  return (
    <>
      {STUDIO_EVENT_COMMAND_CATEGORY_LIST.map((category) => (
        <EventCommandCategory key={category} title={t(`event_category_${category}`)} onClick={() => setSelectedCommandCategory(category)} />
      ))}
    </>
  );
};
