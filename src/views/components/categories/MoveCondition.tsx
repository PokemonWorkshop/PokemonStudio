import styled from 'styled-components';
import { Condition } from './Condition';

type MoveConditionProps = { condition: string };

export const MoveCondition = styled(Condition).attrs<MoveConditionProps>((props) => ({
  'data-condition': props.condition,
}))<MoveConditionProps>`
  &[data-condition='cool'] {
    background: rgba(238, 148, 116, 0.12);
    color: rgba(238, 148, 116, 1);
  }

  &[data-condition='beautiful'] {
    background: rgba(69, 150, 237, 0.12);
    color: rgba(69, 150, 237, 1);
  }

  &[data-condition='cute'] {
    background: rgba(233, 129, 164, 0.12);
    color: rgba(233, 129, 164, 1);
  }

  &[data-condition='clever'] {
    background: rgba(37, 203, 44, 0.12);
    color: rgba(37, 203, 44, 1);
  }

  &[data-condition='tough'] {
    background: rgba(245, 171, 61, 0.12);
    color: rgba(245, 171, 61, 1);
  }
`;
