import { DarkButton, DeleteButton, SecondaryButton } from '@components/buttons';
import { EditButtonOnlyIconContainer } from '@components/buttons/EditButtonOnlyIcon';
import { InputWithLeftLabelContainer } from '@components/inputs';
import styled from 'styled-components';

export const DashboardLanguageTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: -8px;
  margin-right: -8px;

  .language {
    display: flex;
    box-sizing: border-box;
    padding: 4px 4px 4px 8px;
    gap: 48px;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    border-radius: 8px;

    :hover {
      background-color: ${({ theme }) => theme.colors.dark18};

      .buttons {
        visibility: visible;
      }
    }

    .langage-name {
      color: ${({ theme }) => theme.colors.text100};
      ${({ theme }) => theme.fonts.normalMedium}

      .language-code {
        color: ${({ theme }) => theme.colors.text400};
        ${({ theme }) => theme.fonts.normalMedium}
      }
    }

    .buttons {
      display: flex;
      gap: 8px;
      visibility: hidden;

      ${DarkButton},
      ${SecondaryButton},
      ${DeleteButton} {
        height: 32px;
      }

      ${DeleteButton} {
        width: 32px;
      }

      ${EditButtonOnlyIconContainer} {
        background-color: ${({ theme }) => theme.colors.primarySoft};
        width: 32px;

        &:hover {
          background-color: ${({ theme }) => theme.colors.secondaryHover};
        }

        &:active {
          background-color: ${({ theme }) => theme.colors.primarySoft};
        }
      }

      .actions {
        display: flex;
        gap: 4px;
      }
    }
  }

  .empty-list {
    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }
`;

export const LanguageDefaultContainer = styled(InputWithLeftLabelContainer)`
  gap: 24px;
  text-wrap: nowrap;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
  padding-top: 16px;
  margin-top: -8px;

  div {
    width: 100%;
  }
`;
