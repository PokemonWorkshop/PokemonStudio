import { ResourceWrapper, ResourcesContainer } from '@components/resources';
import React, { useState } from 'react';
import { OnboardingBlock } from './OnboardingBlock';
import styled from 'styled-components';
import { OnboardingLocalStorage, getOnboarding, updateOnboarding } from '@utils/onboarding';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  return (
    <ResourcesContainer>
      <OnboardingTitleContainer>{t('first_steps')}</OnboardingTitleContainer>
      <ResourceWrapper size="third">
        <OnboardingBlock
          type={state.tiled}
          title={t('tiled_title')}
          message={t('tiled_message')}
          textButton={t('tiled_title')}
          index={1}
          max={3}
          onClick={() => {
            if (state.tiled === 'current') updateStep({ tiled: 'validate', maps: 'current', createGame: 'noValidate' });
            window.api.externalWindow('https://www.mapeditor.org');
          }}
        />
        <OnboardingBlock
          type={state.maps}
          title={t('maps_title')}
          message={t('maps_message')}
          textButton={t('maps_title')}
          index={2}
          max={3}
          onClick={() => {
            if (state.maps === 'current') updateStep({ tiled: 'validate', maps: 'validate', createGame: 'current' });
            navigate('/world/map');
          }}
        />
        <OnboardingBlock
          type={state.createGame}
          title={t('rmxp_title')}
          message={t('rmxp_message')}
          textButton={t('rmxp_button')}
          index={3}
          max={3}
          onClick={() => state.createGame === 'current' && updateStep({ tiled: 'validate', maps: 'validate', createGame: 'validate' })}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
