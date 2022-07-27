import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon, DarkButton } from '@components/buttons';
import { AbilityControlBar, AbilityFrame, AbilityParametersData } from '@components/database/ability';
import { AbilityFrameEditor, AbilityNewEditor } from '@components/database/ability/editors';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { EditorOverlay } from '@components/editor';
import { Deletion, DeletionOverlay } from '@components/deletion';

import { useProjectAbilities } from '@utils/useProjectData';
import { useHistory } from 'react-router-dom';
import { useTranslationEditor } from '@utils/useTranslationEditor';

export const AbilityPage = () => {
  const {
    projectDataValues: abilities,
    selectedDataIdentifier: abilityDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setAbilities,
    removeProjectDataValue: deleteAbility,
  } = useProjectAbilities();
  const { t } = useTranslation('database_abilities');
  const history = useHistory();
  const onClickedPokemonList = () => history.push(`/database/abilities/pokemon`);
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ ability: selected.value });
  const ability = abilities[abilityDbSymbol];
  const currentEditedAbility = useMemo(() => ability.clone(), [ability]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);

  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 4 },
      translation_description: { fileId: 5, isMultiline: true },
    },
    currentEditedAbility.textId,
    currentEditedAbility.name()
  );

  const onCloseEditor = () => {
    if (currentEditor === 'frame' && ability.name() === '') return;
    setAbilities({ [ability.dbSymbol]: currentEditedAbility });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(abilities)
      .map(([value, abilityData]) => ({ value, index: abilityData.name() }))
      .filter((d) => d.value !== abilityDbSymbol)
      .sort((a, b) => a.index.localeCompare(b.index))[0].value;
    deleteAbility(abilityDbSymbol, { ability: firstDbSymbol });
    setCurrentDeletion(undefined);
  };

  const editors = {
    frame: <AbilityFrameEditor ability={ability} openTranslationEditor={openTranslationEditor} />,
    new: <AbilityNewEditor onClose={() => setCurrentEditor(undefined)} />,
  };

  const deletions = {
    deletion: (
      <Deletion
        title={t('deletion_of', { ability: ability.name() })}
        message={t('deletion_message', { ability: ability.name() })}
        onClickDelete={onClickDelete}
        onClose={() => setCurrentDeletion(undefined)}
      />
    ),
  };

  return (
    <DatabasePageStyle>
      <AbilityControlBar onChange={onChange} ability={ability} onClickNewAbility={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <AbilityFrame ability={ability} onClick={() => setCurrentEditor('frame')} />
            <AbilityParametersData ability={ability} onClick={() => setCurrentEditor('params')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={`${t('pokemon_with_ability')} ${ability.name()}`}>
              <DarkButton onClick={onClickedPokemonList}>{t('button_list_pokemon')}</DarkButton>
            </DataBlockWithAction>
            <DataBlockWithAction size="full" title={t('deleting')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('deletion')} disabled={Object.entries(abilities).length == 1}>
                {t('delete')}
              </DeleteButtonWithIcon>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <EditorOverlay currentEditor={currentEditor} editors={editors} subEditor={translationEditor} onClose={onCloseEditor} />
          <DeletionOverlay currentDeletion={currentDeletion} deletions={deletions} onClose={() => setCurrentDeletion(undefined)} />
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DatabasePageStyle>
  );
};
