import React, { useEffect } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { DataBlockWithTitleNoActive, DataBlockWrapper } from '@components/database/dataBlocks';
import { AbilityControlBar, AbilityPokemonTable } from '@components/database/ability';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { useProjectAbilities } from '@utils/useProjectData';
import { StudioShortcut } from '@src/GlobalStateProvider';
import { useShortcut } from '@utils/useShortcuts';

export const AbilityPokemonPage = () => {
  const {
    projectDataValues: abilities,
    selectedDataIdentifier: abilityDbSymbol,
    setSelectedDataIdentifier,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const history = useHistory();
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const ability = abilities[abilityDbSymbol];

  const onChange = (selected: SelectOption) => {
    setSelectedDataIdentifier({ ability: selected.value });
  };
  const onClickedBack = () => history.push('database/abilities');

  useEffect(() => {
    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      setSelectedDataIdentifier({ ability: getPreviousDbSymbol(abilities, ability.id) });
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      setSelectedDataIdentifier({ ability: getNextDbSymbol(abilities, ability.id) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut]);

  return (
    <DatabasePageStyle>
      <AbilityControlBar onChange={onChange} ability={ability} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={t('pokemon_with_ability', { ability: ability.name() })} onClickedBack={onClickedBack} />
            <DataBlockWithTitleNoActive title={t('pokemon_with_ability', { ability: ability.name() })} size="full">
              <AbilityPokemonTable ability={ability} />
            </DataBlockWithTitleNoActive>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
