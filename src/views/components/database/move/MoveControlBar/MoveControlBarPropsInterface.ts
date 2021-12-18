import MoveModel from '@modelEntities/move/Move.model';
import { SelectOption } from '../../../SelectCustom/SelectCustomPropsInterface';

export type MoveControlBarProps = {
  onMoveChange: (selected: SelectOption) => void;
  move: MoveModel;
  onClickNewMove?: () => void;
};
