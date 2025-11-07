import styled from 'styled-components';
import { Input } from './Input';

export const InputWithLeftLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  & > ${Input}, & > div > ${Input}, & > div > input {
    width: 80px;
  }

  .helper {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
    user-select: none;
  }
`;
