import React from 'react';
import { CommandLibraryCategory } from './CommandLibraryCategory';
import { STUDIO_EVENT_COMMAND_CATEGORY_LIST, type StudioEventCommandCategory } from '@root/src/models/entities/event/category';

type CommandLibraryCategoriesProps = {
  setSelectedCommandCategory: (commandCategory: StudioEventCommandCategory) => void;
};

export const CommandLibraryCategories = ({ setSelectedCommandCategory }: CommandLibraryCategoriesProps) => {
  return (
    <div className="categories">
      {STUDIO_EVENT_COMMAND_CATEGORY_LIST.map((category) => (
        <CommandLibraryCategory key={category} category={category} onClick={() => setSelectedCommandCategory(category)} />
      ))}
    </div>
  );
};
