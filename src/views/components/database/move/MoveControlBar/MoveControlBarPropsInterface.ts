import { StudioMove } from '@modelEntities/move';
import { SelectChangeEvent } from '../../../SelectCustom/SelectCustomPropsInterface';

export type MoveControlBarProps = {
  onMoveChange: SelectChangeEvent;
  move: StudioMove;
  onClickNewMove?: () => void;
};
