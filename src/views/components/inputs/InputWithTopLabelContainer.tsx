import styled from 'styled-components';

export const InputWithTopLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .helper {
    ${({ theme }) => theme.fonts.normalSmall};
    color: ${({ theme }) => theme.colors.text400};
    user-select: none;
  }
`;
