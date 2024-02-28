import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceWrapper, ResourcesContainer, SpriteResource, TitleResource } from '@components/resources';
import { trainerResourcePath } from '@utils/path';
import styled from 'styled-components';
import { ReactComponent as HelpIcon } from '@assets/icons/navigation/help-icon.svg';
import { ToolTip, ToolTipContainer } from '@components/Tooltip';
import { StudioTrainer } from '@modelEntities/trainer';
import { useUpdateResources } from './useUpdateResources';

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

type CharacterResourceProps = {
  trainer: StudioTrainer;
};

export const CharacterResource = ({ trainer }: CharacterResourceProps) => {
  const { t } = useTranslation('database_trainers');
  const { onResourceGraphicsChoosen, onResourceGraphicsClean } = useUpdateResources(trainer);

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
          onResourceChoosen={(resourcePath) => onResourceGraphicsChoosen(resourcePath, 'character')}
          onResourceClean={() => onResourceGraphicsClean('character')}
        />
      </ResourceWrapper>
    </ResourcesContainer>
  );
};
