import { ResourceWrapper, ResourcesContainer } from '@components/resources';
import React, { useState } from 'react';
import { OnboardingBlock } from './OnboardingBlock';
import styled from 'styled-components';
import { OnboardingLocalStorage, getOnboarding, updateOnboarding } from '@utils/onboarding';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { assertUnreachable } from '@utils/assertUnreachable';

const OnboardingTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;
  ${({ theme }) => theme.fonts.titlesHeadline6}
  color: ${({ theme }) => theme.colors.text400};
`;

export const Onboarding = () => {
  const [state, setState] = useState(getOnboarding());
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();

  const updateStep = (updated: OnboardingLocalStorage) => {
    setState(updated);
    updateOnboarding(updated);
  };

  const onClick = (step: keyof OnboardingLocalStorage) => {
    switch (step) {
      case 'tiled':
        if (state.tiled === 'current') updateStep({ tiled: 'validate', maps: 'current', createGame: 'noValidate' });
        return window.api.externalWindow('https://www.mapeditor.org');
      case 'maps':
        if (state.maps === 'current') updateStep({ tiled: 'validate', maps: 'validate', createGame: 'current' });
        return navigate('/world/map');
      case 'createGame':
        return state.createGame === 'current' && updateStep({ tiled: 'validate', maps: 'validate', createGame: 'validate' });
      default:
        assertUnreachable(step);
    }
  };

  /** The onboarding flow reset is only available in dev mode. Click on 'First steps' to reset */
  const resetOnboarding = () => {
    if (!window.api.isDev) return;

    updateStep({ tiled: 'current', maps: 'noValidate', createGame: 'noValidate' });
  };

  return (
    <ResourcesContainer>
      <OnboardingTitleContainer onClick={resetOnboarding}>{t('first_steps')}</OnboardingTitleContainer>
      <ResourceWrapper size="third">
        {(['tiled', 'maps', 'createGame'] as (keyof OnboardingLocalStorage)[]).map((step, index) => (
          <OnboardingBlock
            key={step}
            type={state[step]}
            title={t(`${step}_title`)}
            message={t(`${step}_message`)}
            textButton={step === 'createGame' ? t('createGame_button') : t(`${step}_title`)}
            index={index + 1}
            max={3}
            onClick={() => onClick(step)}
          />
        ))}
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
