import type { StudioEvent } from '@modelEntities/event/event';
import { CommandId } from '../../../../../../models/entities/event/globalCommand';

export type EventEditorProps = {
  commandId?: CommandId;
  event: StudioEvent;
};
