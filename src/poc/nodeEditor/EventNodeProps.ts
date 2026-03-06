import type { StudioEventCommand } from '@modelEntities/event/command';
import type { EventDialogsRef } from './EventEditorOverlay';

export type EventNodeProps = {
  id: string;
  data: {
    dialogsRef?: EventDialogsRef;
    command: StudioEventCommand;
    comments: string[];
  };
  selected?: boolean;
};
