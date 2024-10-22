import { MOVE_STATUS_LIST } from '@modelEntities/move';

export const isCustomStatus = (status: string) => {
  return !([...MOVE_STATUS_LIST, '__undef__'] as ReadonlyArray<string>).includes(status);
};
