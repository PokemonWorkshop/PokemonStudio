import { ResourceWrapper, ResourcesContainer } from '@components/resources';
import React, { useState } from 'react';
import { OnboardingBlock } from './OnboardingBlock';
import styled from 'styled-components';
import { OnboardingLocalStorage, getOnboarding, updateOnboarding } from '@utils/onboarding';
import { useNavigate } from 'react-router-dom';

const OnboardingTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;
  ${({ theme }) => theme.fonts.titlesHeadline6}
  color: ${({ theme }) => theme.colors.text400};
`;

export const Onboarding = () => {
  const [state, setState] = useState(getOnboarding());
  const navigate = useNavigate();

  const updateStep = (updated: OnboardingLocalStorage) => {
    setState(updated);
    updateOnboarding(updated);
  };

  return (
    <ResourcesContainer>
      <OnboardingTitleContainer>{'Premiers pas'}</OnboardingTitleContainer>
      <ResourceWrapper size="third">
        <OnboardingBlock
          type={state.tiled}
          title={'Télécharger Tiled'}
          message={
            "Pour commencer, Tiled est nécessaire pour créer et modifier les cartes de ton jeu.\n\n Ce logiciel gratuit offre une multitude d'outils qui vont te faciliter la vie"
          }
          textButton={'Télécharger Tiled'}
          index={1}
          max={3}
          onClick={() => {
            updateStep({ tiled: 'validate', maps: 'current', createGame: 'noValidate' });
            window.api.externalWindow('https://www.mapeditor.org');
          }}
        />
        <OnboardingBlock
          type={state.maps}
          title={'Ajouter des cartes'}
          message={
            'Pokémon Studio permet de faire le lien entre Tiled et RPG Maker XP.\n\n Les cartes Tiled importées dans Pokémon Studio peuvent ensuite être ouvertes avec RPG Maker XP.'
          }
          textButton={'Ajouter des cartes'}
          index={2}
          max={3}
          onClick={() => {
            updateStep({ tiled: 'validate', maps: 'validate', createGame: 'current' });
            navigate('/world/map');
          }}
        />
        <OnboardingBlock
          type={state.createGame}
          title={'Créer mon jeu'}
          message={"Tu retrouves enfin tes cartes sur RPG Maker XP afin d'ajouter les commandes qui donneront vie à celles-ci."}
          textButton={"J'ai compris"}
          index={3}
          max={3}
          onClick={() => updateStep({ tiled: 'validate', maps: 'validate', createGame: 'validate' })}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
