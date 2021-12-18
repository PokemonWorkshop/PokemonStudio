import styled from 'styled-components';

export const InputWithSeparatorContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;

  & span.separator {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
    user-select: none;
  }
`;
