import MoveModel from '@modelEntities/move/Move.model';

export type MoveDataProps = {
  move: MoveModel;
  onClick?: () => void;
};
