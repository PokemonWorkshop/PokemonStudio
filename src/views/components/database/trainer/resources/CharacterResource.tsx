import React from 'react';
import { useTrainerPage } from '@utils/usePage';
import { useTranslation } from 'react-i18next';
import { useUpdateTrainer } from '../editors/useUpdateTrainer';
import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource } from '@components/resources';
import { basename, trainerResourcePath } from '@utils/path';
import styled from 'styled-components';
import { ReactComponent as HelpIcon } from '@assets/icons/navigation/help-icon.svg';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';

const HelpContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  .tooltip {
    display: flex;
    align-items: center;
    min-width: 250px;
  }

  svg {
    color: ${({ theme }) => theme.colors.text500};
    width: 18px;
    height: 18px;

    :hover {
      color: ${({ theme }) => theme.colors.text400};
    }
  }
`;

export const CharacterResource = () => {
  const { t } = useTranslation('database_trainers');
  const { trainer } = useTrainerPage();
  const updateTrainer = useUpdateTrainer(trainer);

  const handleResourceChoosen = (resourcePath: string) => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        character: basename(resourcePath, '.png'),
      },
    });
  };

  const handleResourceClean = () => {
    updateTrainer({
      resources: {
        ...trainer.resources,
        character: '',
      },
    });
  };

  return (
    <ResourcesContainer>
      <HelpContainer>
        <TitleResource title={t('character')} />
        <ToolTipContainer className="tooltip">
          <ToolTip bottom="100%">{t('character_v3_message')}</ToolTip>
          <HelpIcon />
        </ToolTipContainer>
      </HelpContainer>
      <ResourceWrapper size="fourth">
        <SpriteResource
          type="character"
          title={t('character')}
          resourcePath={trainerResourcePath(trainer, 'character')}
          extensions={['png']}
          onResourceChoosen={handleResourceChoosen}
          onResourceClean={handleResourceClean}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
