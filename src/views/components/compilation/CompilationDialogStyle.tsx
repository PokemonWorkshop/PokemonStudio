import { MessageBoxContainer } from '@components/MessageBoxContainer';
import { PrimaryButton } from '@components/buttons';
import { Input } from '@components/inputs';
import styled from 'styled-components';

export const CompilationDialogContainer = styled(MessageBoxContainer)`
  width: 700px;
  height: auto;
  background-color: ${({ theme }) => theme.colors.dark16};

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 32px;

    .title {
      ${({ theme }) => theme.fonts.titlesHeadline6}
      color: ${({ theme }) => theme.colors.text100};
    }

    .icon {
      height: 32px;
      width: 32px;
      padding: 0;
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 48px;
    border-top: 1px solid ${({ theme }) => theme.colors.dark20};
    padding-top: 16px;
    align-items: center;
    margin-top: auto;

    .executable-info {
      ${({ theme }) => theme.fonts.normalRegular}
      color: ${({ theme }) => theme.colors.text400};
    }

    ${PrimaryButton} {
      min-width: max-content;
    }
  }
`;

export const CompilationFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  height: 100%;

  .game-info {
    display: flex;
    flex-direction: column;
    gap: 12px;

    ${Input} {
      width: 478px;
      text-align: left;
    }
  }
`;

export const CompilationOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};

  .header {
    ${({ theme }) => theme.fonts.titlesOverline}
    color: ${({ theme }) => theme.colors.text400};
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 16px;
  }

  .option {
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.dark24};

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .title {
        ${({ theme }) => theme.fonts.normalMedium}
        color: ${({ theme }) => theme.colors.text100};
      }

      .description {
        ${({ theme }) => theme.fonts.normalRegular}
        color: ${({ theme }) => theme.colors.text400};
      }
    }

    .toggle {
      display: flex;
      align-items: center;
    }
  }
`;
