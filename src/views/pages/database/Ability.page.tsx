import React from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon, DarkButton } from '@components/buttons';
import { AbilityControlBar, AbilityFrame } from '@components/database/ability';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';

import { useNavigate } from 'react-router-dom';
import { useAbilityPage } from '@hooks/usePage';
import { AbilityEditorAndDeletionKeys, AbilityEditorOverlay } from '@components/database/ability/editors/AbilityEditorOverlay';
import { useDialogsRef } from '@hooks/useDialogsRef';

export const AbilityPage = () => {
  const dialogsRef = useDialogsRef<AbilityEditorAndDeletionKeys>();
  const { ability, abilityName, cannotDelete } = useAbilityPage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onClickedPokemonList = () => navigate(`/database/abilities/pokemon`);

  return (
    <DatabasePageStyle>
      <AbilityControlBar dialogsRef={dialogsRef} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <AbilityFrame ability={ability} dialogsRef={dialogsRef} />
            {/* <AbilityParametersData ability={ability} dialogsRef={dialogsRef} /> */}
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('creature_with_ability', { ability: abilityName })}>
              <DarkButton onClick={onClickedPokemonList}>{t('button_list_creature')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => dialogsRef.current?.openDialog('deletion', true)} disabled={cannotDelete}>
                {t('delete_this_ability')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <AbilityEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
