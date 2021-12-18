import styled from 'styled-components';
import { Input } from './Input';
import { InputWithLeftLabelContainer } from './InputWithLeftLabelContainer';

export const InputWithColorLabelContainer = styled(InputWithLeftLabelContainer)`
  & > ${Input}, & > div > ${Input} {
    width: 100px;
  }
`;
