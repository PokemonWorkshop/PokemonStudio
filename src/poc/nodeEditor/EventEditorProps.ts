import type { CommandId } from '@modelEntities/event/command';
import type { StudioEvent } from '@modelEntities/event/event';

export type EventEditorProps = {
  commandId?: CommandId;
  event: StudioEvent;
};
