import React, { useMemo } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { AbilityControlBar, AbilityPokemonTable } from '@components/database/ability';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { useProjectAbilities } from '@utils/useProjectData';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';

export const AbilityPokemonPage = () => {
  const {
    projectDataValues: abilities,
    selectedDataIdentifier: abilityDbSymbol,
    setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const navigate = useNavigate();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    return {
      db_previous: () => setSelectedDataIdentifier({ ability: getPreviousDbSymbol('name') }),
      db_next: () => setSelectedDataIdentifier({ ability: getNextDbSymbol('name') }),
    };
  }, [setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);
  useShortcut(shortcutMap);

  const ability = abilities[abilityDbSymbol];

  const onChange: SelectChangeEvent = (selected) => {
    setSelectedDataIdentifier({ ability: selected.value });
  };
  const onClickedBack = () => navigate('/database/abilities');

  return (
    <DatabasePageStyle>
      <AbilityControlBar onChange={onChange} ability={ability} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_ability', { ability: getAbilityName(ability) })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_ability', { ability: getAbilityName(ability) })} size="full">
              <AbilityPokemonTable ability={ability} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
