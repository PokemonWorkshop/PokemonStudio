import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { BaseButtonStyle, WarningButton } from '@components/buttons';
import { DataBlockContainer } from '@components/database/dataBlocks';

const MapUpdateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;

  // TODO: Remove h2 rule from global style & remove '!important' from here!
  h2 {
    color: ${(props) => props.theme.colors.text100} !important;
    margin-bottom: 8px;
  }

  .message {
    font-size: 14px;
    color: ${(props) => props.theme.colors.text100};
  }

  ${BaseButtonStyle} {
    white-space: nowrap;
  }

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    flex-direction: column;
    align-items: start;
  }
`;

export const MapUpdate = () => {
  const { t } = useTranslation('database_maps');
  return (
    <DataBlockContainer size="full" color="warning" data-disabled="true">
      <MapUpdateContainer>
        <div>
          <h2>{t('update_maps')}</h2>
          <span className="message">{t('update_maps_message')}</span>
        </div>
        <WarningButton onClick={() => console.log('update maps')}>{t('update_maps_button')}</WarningButton>
      </MapUpdateContainer>
    </DataBlockContainer>
  );
};
