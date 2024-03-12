import styled from 'styled-components';
import { Input } from './Input';
import { SelectContainer } from '@ds/Select/SelectContainer';

export const InputWithLeftLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  & > ${Input}, & > div > ${Input}, & > div > input {
    width: 80px;
  }
`;
