import type { CommandListId, StudioEvent } from '@modelEntities/event/event';

export type EventEditorProps = {
  commandId?: CommandListId;
  event: StudioEvent;
};
