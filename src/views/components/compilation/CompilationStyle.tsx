import { MessageBoxContainer } from '@components/MessageBoxContainer';
import { PrimaryButton } from '@components/buttons';
import { Input, LoggerInput } from '@components/inputs';
import { BlockProgressBar } from '@components/progress-bar/ProgressBar';
import styled from 'styled-components';

export const CompilationDialogContainer = styled(MessageBoxContainer)`
  width: 700px;
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
    justify-content: space-between;

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
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};

  .options-title {
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

export const CompilationLogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  user-select: none;
  height: 100%;
  width: 100%;

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline6};
    ${({ theme }) => theme.colors.text100};
  }

  .logs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;

    ${LoggerInput} {
      height: 100%;
      overflow-y: scroll;
    }

    .actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
      justify-content: flex-end;
    }
  }

  .success {
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 8px 16px;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.successBase};
    background-color: ${({ theme }) => theme.colors.successSoft};
    min-height: 56px;
    box-sizing: border-box;

    .icon-message {
      display: flex;
      gap: 16px;
      color: ${({ theme }) => theme.colors.successBase};
      align-items: center;

      .message {
        ${({ theme }) => theme.fonts.normalRegular}
        color: ${({ theme }) => theme.colors.text100};
      }
    }

    .show-folder {
      ${({ theme }) => theme.fonts.normalMedium}
      color: ${({ theme }) => theme.colors.successBase};

      :hover {
        cursor: pointer;
      }
    }
  }

  .error {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.dangerBase};
  }
`;

type ProgressBarCompilationContainerProps = {
  isError: boolean;
};

export const ProgressBarCompilationContainer = styled(BlockProgressBar)<ProgressBarCompilationContainerProps>`
  justify-content: initial;
  gap: 12px;
  width: 100%;

  .progress {
    width: 100%;
    height: 12px;
  }

  .progress::-webkit-progress-value {
    background: ${({ theme, isError }) => (isError ? theme.colors.dangerBase : theme.colors.successBase)};
  }

  .progress-message {
    ${({ theme, isError }) => (isError ? theme.fonts.normalMedium : theme.fonts.normalRegular)}
    color: ${({ theme, isError }) => (isError ? theme.colors.dangerBase : theme.colors.text100)};
  }

  .platform {
    ${({ theme }) => theme.fonts.normalMedium}
    color: ${({ theme }) => theme.colors.text100};
  }
`;
