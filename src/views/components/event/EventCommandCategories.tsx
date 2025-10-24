import React from 'react';
import { EventCommandCategory } from './EventCommandCategory';
import { STUDIO_EVENT_COMMAND_CATEGORY_LIST, StudioEventCommandCategory } from '@root/src/models/entities/event/category';

type EventCommandsCategoryProps = {
  setSelectedCommandCategory: (commandCategory: StudioEventCommandCategory) => void;
};

export const EventCommandCategories = ({ setSelectedCommandCategory }: EventCommandsCategoryProps) => {
  return (
    <>
      {STUDIO_EVENT_COMMAND_CATEGORY_LIST.map((category) => (
        <EventCommandCategory key={category} category={category} onClick={() => setSelectedCommandCategory(category)} />
      ))}
    </>
  );
};
