import { PrimaryButton, SecondaryButton } from '@components/buttons';
import {
  ActionContainer,
  BrandingActionContainer,
  BrandingButtonContainer,
  BrandingCurrentVersion,
  BrandingTitle,
  BrandingTitleContainer,
  Footer,
  PSDKUpdatePageContainer,
} from '@components/psdkupdate';
import type { PSDKVersion } from '@services/getPSDKVersion';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useLoaderRef } from '@utils/loaderContext';
import { showNotification } from '@utils/showNotification';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PSDKUpdateState =
  | {
      loading: true;
      currentVersion: PSDKVersion;
      lastVersion?: PSDKVersion;
    }
  | {
      loading: false;
      currentVersion: PSDKVersion;
      lastVersion: PSDKVersion;
    };

const needUpdate = (state: PSDKUpdateState) => (state.loading ? false : state.currentVersion.int < state.lastVersion.int);

const PSDKUpdatePageComponent = () => {
  const { t } = useTranslation(['psdk_update']);
  const [globalState, setGlobalState] = useGlobalState();
  const [state, setState] = useState<PSDKUpdateState>({ loading: true, currentVersion: globalState.currentPSDKVersion });
  const loaderContextRef = useLoaderRef();

  useEffect(() => {
    window.api.getLastPSDKVersion().then((lastVersion) => {
      setState({ ...state, loading: false, lastVersion });
      setGlobalState({ ...globalState, lastPSDKVersion: lastVersion });
    });

    return () => window.api.unregisterPSDKUpdateEvents();
  }, []);

  const updatePSDK = (): void => {
    if (state.loading) return;
    loaderContextRef.current.open('updating_psdk', 0, 0, t('psdk_update:update_pending'));
    window.api.updatePSDK(
      state.currentVersion.int,
      (current, total, version) => loaderContextRef.current.setProgress(current, total, t('psdk_update:update_status', { version: version.string })),
      (success) => {
        if (success) {
          loaderContextRef.current.close();
          showNotification('success', t('psdk_update:notif_title'), t('psdk_update:update_success'));
          setState({ ...state, currentVersion: state.lastVersion });
          setGlobalState({ ...globalState, currentPSDKVersion: state.lastVersion });
        } else {
          loaderContextRef.current.setError('updating_psdk_error', t('psdk_update:update_error'));
        }
      }
    );
  };

  return (
    <PSDKUpdatePageContainer>
      <ActionContainer>
        <BrandingActionContainer>
          <BrandingTitleContainer>
            <BrandingTitle>{t('psdk_update:title')}</BrandingTitle>
            <BrandingCurrentVersion>
              {state.loading ? ' ' : t('psdk_update:version', { version: state.currentVersion.string })}
            </BrandingCurrentVersion>
          </BrandingTitleContainer>
          <BrandingButtonContainer>
            {!state.loading && !needUpdate(state) && <span>{t('psdk_update:project_up_to_date')}</span>}
            <PrimaryButton onClick={updatePSDK} disabled={!needUpdate(state)}>
              {t('psdk_update:update')}
            </PrimaryButton>
            <SecondaryButton href="https://discord.com/channels/143824995867557888/527528414626971663" target="_blank">
              {t('psdk_update:view_latest_changes')}
            </SecondaryButton>
          </BrandingButtonContainer>
        </BrandingActionContainer>
      </ActionContainer>
      <Footer version={state.loading ? '' : state.lastVersion.string} />
    </PSDKUpdatePageContainer>
  );
};

export default PSDKUpdatePageComponent;
