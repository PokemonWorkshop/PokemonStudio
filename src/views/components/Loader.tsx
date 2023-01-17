import { ReactComponent as MainIcon } from '@assets/icons/global/loaderIcon.svg';
import { useLoaderContext } from '@utils/loaderContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ErrorDialog } from './error';

const LoaderContainer = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  color: ${({ theme }) => theme.colors.text100};
  background-color: ${({ theme }) => theme.colors.dark12};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  user-select: none;
  transition: 0.2s ease-in-out;

  &.visible {
    visibility: visible;
    opacity: 1;
  }

  &.has-error {
    background-color: rgba(10, 9, 11, 0.3);
  }

  & > div {
    min-height: 133px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  & > div > svg {
    margin-bottom: 20px;
  }
`;

const LoaderReasonText = styled.span`
  ${({ theme }) => theme.fonts.titlesHeadline6}
`;

const LoaderCurrentActionText = styled.span`
  ${({ theme }) => theme.fonts.normalRegular}
  color: ${({ theme }) => theme.colors.text400};

  & strong {
    ${({ theme }) => theme.fonts.normalMedium}
  }
`;

export const Loader = () => {
  const { thingInProgress, step, total, stepText, errorTitle, errorText, isOpen, isLogsAvailable, close } = useLoaderContext();
  const { t } = useTranslation('loader');

  const containerClass = isOpen ? (errorTitle ? 'visible has-error' : 'visible') : undefined;

  return (
    <LoaderContainer className={containerClass}>
      {errorTitle ? (
        <ErrorDialog title={t(errorTitle)} message={errorText} isLogsAvailable={isLogsAvailable} onClose={close} />
      ) : (
        <div>
          <MainIcon />
          <LoaderReasonText>{t(thingInProgress)}</LoaderReasonText>
          <LoaderCurrentActionText>
            <strong>{total !== 0 && t('step', { step, total })}</strong> {stepText}
          </LoaderCurrentActionText>
        </div>
      )}
    </LoaderContainer>
  );
};
