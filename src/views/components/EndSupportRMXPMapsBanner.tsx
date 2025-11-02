import { WarningButton } from './buttons';
import { useTranslation } from 'react-i18next';
import IconInfo from '@assets/icons/notification/info.svg';
import IconClose from '@assets/icons/global/clear-icon.svg';
import styled from 'styled-components';
import React, { useEffect, useRef } from 'react';
import { useDialogsRef } from '@root/src/hooks/useDialogsRef';
import { DashboardEditorAndDeletionKeys, DashboardEditorOverlay } from './dashboard/editors/DashboardEditorOverlay';
import { useProjectStudio } from '@root/src/hooks/useProjectStudio';

export const EndSupportRMXPMapsBannerContainer = styled.div`
  position: absolute;
  bottom: 24px;
  left: calc(50% + 32px);
  transform: translate(-50%, 0);
  display: grid;
  grid-template-columns: 20px auto 93px 32px;
  grid-gap: 8px;
  padding: 8px 8px 8px 16px;
  height: 54px;
  align-items: center;
  ${({ theme }) => theme.fonts.normalRegular}
  background-color: ${({ theme }) => theme.colors.warningSoft};
  border: 1px solid ${({ theme }) => theme.colors.warningSoft};
  backdrop-filter: blur(12px);
  border-radius: 8px;
  width: 1024px;
  box-sizing: border-box;
  user-select: none;
  visibility: hidden;
  z-index: 100;

  @media ${({ theme }) => theme.breakpoints.smallScreen} {
    width: 512px;
    height: 108px;
  }

  .info-icon {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.warningBase};

    svg {
      width: 20px;
      height: auto;
    }
  }

  .close-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.warningBase};
    height: 32px;

    &:hover {
      cursor: pointer;
    }

    svg {
      width: 12px;
      height: auto;
    }
  }

  ${WarningButton} {
    padding: 0px 12px;
    height: 32px;
    ${({ theme }) => theme.fonts.normalSmall};
    //font-weight: 500;
  }
`;

export const EndSupportRMXPMapsBanner = () => {
  const { projectStudioValues: projectStudio } = useProjectStudio();
  const dialogsRef = useDialogsRef<DashboardEditorAndDeletionKeys>();
  const bannerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const updateBannerVisibility = (v: 'hidden' | 'visible') => {
    if (!bannerRef.current) return;

    bannerRef.current.style.visibility = v;
  };

  useEffect(() => {
    const listener = () => {
      if (projectStudio?.isTiledMode) return;

      updateBannerVisibility('visible');
    };

    window.addEventListener('project-opened', listener);
    return () => window.removeEventListener('project-opened', listener);
  }, [projectStudio]);

  return (
    <>
      <EndSupportRMXPMapsBannerContainer ref={bannerRef}>
        <div className="info-icon">
          <IconInfo />
        </div>
        Le support de RPG Maker XP en tant qu'outil de création de vos cartes sera arrêté dans une prochaine mise à jour et l'utilisation de Tiled
        sera obligatoire.
        <WarningButton onClick={() => dialogsRef.current?.openDialog('studio_mode_message_box', true)}>{t('button_use_tiled')}</WarningButton>
        <div className="close-icon" onClick={() => updateBannerVisibility('hidden')}>
          <IconClose />
        </div>
      </EndSupportRMXPMapsBannerContainer>
      <DashboardEditorOverlay ref={dialogsRef} />
    </>
  );
};
