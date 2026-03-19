import type { StudioEventCommand, StudioEventCommandData } from '@modelEntities/event/command';
import type { EventDialogsRef } from './editors/EventEditorOverlay';

export type EventNodeProps = {
  id: string;
  data: {
    dialogsRef?: EventDialogsRef;
    command: StudioEventCommandData<StudioEventCommand>;
    comments: string[];
  };
  selected?: boolean;
};
