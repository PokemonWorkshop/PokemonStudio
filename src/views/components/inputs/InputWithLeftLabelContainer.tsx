import styled from 'styled-components';
import { Input } from './Input';

export const InputWithLeftLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  & > ${Input}, & > div > ${Input} {
    width: 80px;
  }
`;
