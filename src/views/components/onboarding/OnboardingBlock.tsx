import React from 'react';
import styled from 'styled-components';
import { ReactComponent as SuccessIcon } from '@assets/icons/global/success-onboarding.svg';
import { BaseButtonStyle, DarkButton, InfoButton } from '@components/buttons';
import { OnboardingType } from '@utils/onboarding';

const OnboardingBlockContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 12px;
  box-sizing: border-box;
  border-radius: 8px;
  ${({ theme }) => theme.fonts.normalRegular}
  user-select: none;

  &.validate {
    color: ${({ theme }) => theme.colors.successBase};
    background-color: ${({ theme }) => theme.colors.successSoft};
    border: 1px solid ${({ theme }) => theme.colors.successBase};
  }

  &.current {
    color: ${({ theme }) => theme.colors.infoBase};
    background-color: ${({ theme }) => theme.colors.infoSoft};
    border: 1px solid ${({ theme }) => theme.colors.infoBase};
  }

  &.noValidate {
    color: ${({ theme }) => theme.colors.text400};
    border: 1px solid ${({ theme }) => theme.colors.dark20};
  }

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100%;
    height: 24px;
    ${({ theme }) => theme.fonts.titlesHeadline6}

    .title-validate {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      color: ${({ theme }) => theme.colors.successBase};

      svg {
        color: ${({ theme }) => theme.colors.successBase};
      }
    }

    .title-current {
      color: ${({ theme }) => theme.colors.infoBase};
    }

    .title-noValidate {
      color: ${({ theme }) => theme.colors.text400};
    }

    .progress {
      ${({ theme }) => theme.fonts.normalRegular}
      font-size: 18px;
      font-weight: 600;

      span:last-child {
        font-weight: 400;
      }
    }
  }

  .message {
    color: ${({ theme }) => theme.colors.text100};
    white-space: pre-line;
    height: 100%;
  }

  .footer {
    display: flex;
    justify-content: center;
    width: 100%;

    .validate-link,
    .validate-link-disabled {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
    }
    .validate-link {
      :hover {
        cursor: pointer;
      }
    }

    ${BaseButtonStyle} {
      width: 100%;
    }
  }
`;

type OnboardingBlockProps = {
  type: OnboardingType;
  title: string;
  message: string;
  textButton: string;
  index: number;
  max: number;
  disabledActionWhenValidate?: boolean;
  onClick: () => void;
};

export const OnboardingBlock = ({ type, title, message, textButton, index, max, disabledActionWhenValidate, onClick }: OnboardingBlockProps) => {
  return (
    <OnboardingBlockContainer className={type}>
      <div className="header">
        {type === 'validate' ? (
          <div className="title-validate">
            <SuccessIcon />
            <span>{title}</span>
          </div>
        ) : (
          <div className={`title-${type}`}>{title}</div>
        )}
        <div className="progress">
          <span>{index}</span>
          <span>{`/${max}`}</span>
        </div>
      </div>
      <div className="message">{message}</div>
      <div className="footer">
        {type === 'validate' && (
          <div
            className={disabledActionWhenValidate ? 'validate-link-disabled' : 'validate-link'}
            onClick={() => !disabledActionWhenValidate && onClick()}
          >
            {textButton}
          </div>
        )}
        {type === 'current' && <InfoButton onClick={onClick}>{textButton}</InfoButton>}
        {type === 'noValidate' && <DarkButton disabled={true}>{textButton}</DarkButton>}
      </div>
    </OnboardingBlockContainer>
  );
};
