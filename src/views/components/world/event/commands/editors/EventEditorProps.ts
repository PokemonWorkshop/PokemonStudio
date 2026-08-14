import type { StudioEvent } from '@modelEntities/event/event';
import { CommandId } from '@modelEntities/event/globalCommand';

export type EventEditorProps = {
  commandId?: CommandId;
  event: StudioEvent;
};
