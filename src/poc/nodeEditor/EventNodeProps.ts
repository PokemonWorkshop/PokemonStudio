import type { StudioEventCommand, StudioEventCommandData } from '@modelEntities/event/command';
import type { EventDialogsRef } from './EventEditorOverlay';

export type EventNodeProps = {
  id: string;
  data: {
    dialogsRef?: EventDialogsRef;
    commandType: StudioEventCommand;
    commandData: StudioEventCommandData;
  };
  selected?: boolean;
};
