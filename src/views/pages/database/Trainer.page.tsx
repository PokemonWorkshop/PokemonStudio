import React, { useMemo, useState, useEffect } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useProjectPokemon, useProjectTrainers } from '@utils/useProjectData';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { DeletionOverlay } from '@components/deletion';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { TrainerControlBar, TrainerDeletion, TrainerDialog, TrainerFrame } from '@components/database/trainer';
import { EditorOverlay } from '@components/editor';
import { TrainerImportEditor, TrainerDialogEditor, TrainerFrameEditor, TrainerNewEditor } from '@components/database/trainer/editors';
import { useGlobalState, StudioShortcut } from '@src/GlobalStateProvider';
import { PokemonBattlerList } from '@components/pokemonBattlerList';
import { PokemonBattlerListEditor } from '@components/pokemonBattlerList/editors';
import { cleanExpandPokemonSetup } from '@modelEntities/Encounter';
import { CurrentBattlerType } from '@components/pokemonBattlerList/PokemonBattlerList';
import { BagEntryList, BagEntryListEditor } from '@components/bagEntryList';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { useShortcut } from '@utils/useShortcuts';

export const TrainerPage = () => {
  const {
    projectDataValues: trainers,
    selectedDataIdentifier: trainerDbSymbol,
    setSelectedDataIdentifier,
    setProjectDataValues: setTrainer,
    getPreviousDbSymbol,
    getNextDbSymbol,
  } = useProjectTrainers();
  const { projectDataValues: species } = useProjectPokemon();
  const { t } = useTranslation('database_trainers');
  const onChange = (selected: SelectOption) => setSelectedDataIdentifier({ trainer: selected.value });
  const trainer = trainers[trainerDbSymbol];
  const currentEditedTrainer = useMemo(() => trainer.clone(), [trainer]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({
    index: undefined,
    kind: undefined,
  });
  const [currentBagEntry, setCurrentBagEntry] = useState<number | undefined>(undefined);
  const shortcut = useShortcut([StudioShortcut.DB_PREVIOUS, StudioShortcut.DB_NEXT]);
  const [state] = useGlobalState();
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: 62 },
      translation_class: { fileId: 29 },
      translation_victory: { fileId: 47, isMultiline: true },
      translation_defeat: { fileId: 48, isMultiline: true },
    },
    currentEditedTrainer.id,
    currentEditedTrainer.name()
  );

  const onCloseEditor = () => {
    if (
      currentEditor === 'frame' &&
      (currentEditedTrainer.trainerName() === '' || currentEditedTrainer.trainerClassName() === '' || currentEditedTrainer.battlers.length === 0)
    )
      return;
    if (
      currentEditor === 'battlerEdit' &&
      currentBattler.index !== undefined &&
      currentEditedTrainer.party[currentBattler.index].specie === '__undef__'
    )
      return;
    if (
      currentEditor === 'bagEntryEdit' &&
      currentBagEntry !== undefined &&
      currentEditedTrainer.bagEntries[currentBagEntry].dbSymbol === '__undef__'
    )
      return;
    if (currentEditor === 'battlerEdit' && currentBattler.index !== undefined)
      cleanExpandPokemonSetup(currentEditedTrainer.party[currentBattler.index], species, false);
    if (currentEditor === 'bagEntryEdit') currentEditedTrainer.reduceBagEntries();
    currentEditedTrainer.updatePartyTrainerName();
    currentEditedTrainer.cleaningNaNValues();
    if (currentEditor === 'battlerNew' || currentEditor === 'bagEntryNew') return setCurrentEditor(undefined);
    setTrainer({ [trainer.dbSymbol]: currentEditedTrainer });
    setCurrentEditor(undefined);
    closeTranslationEditor();
  };

  const onCloseDeletion = () => setCurrentDeletion(undefined);

  const onDeleteBattler = (index: number) => {
    setCurrentBattler({ ...currentBattler, index: index });
    setCurrentDeletion('battler');
  };

  const onDeleteBagEntry = (index: number) => {
    currentEditedTrainer.bagEntries.splice(index, 1);
    setTrainer({ [trainer.dbSymbol]: currentEditedTrainer });
  };

  const onEditBagEntry = (index: number) => {
    setCurrentBagEntry(index);
    setCurrentEditor('bagEntryEdit');
  };

  const editors = {
    new: <TrainerNewEditor onClose={() => setCurrentEditor(undefined)} />,
    frame: <TrainerFrameEditor trainer={currentEditedTrainer} openTranslationEditor={openTranslationEditor} />,
    battlerImport: <TrainerImportEditor type="battler" trainer={currentEditedTrainer} onClose={() => setCurrentEditor(undefined)} />,
    dialog: <TrainerDialogEditor trainer={currentEditedTrainer} openTranslationEditor={openTranslationEditor} />,
    battlerEdit: <PokemonBattlerListEditor type="edit" currentBattler={currentBattler} model={currentEditedTrainer} />,
    battlerNew: <PokemonBattlerListEditor type="creation" model={currentEditedTrainer} onClose={() => setCurrentEditor(undefined)} />,
    bagEntryImport: <TrainerImportEditor type="item" trainer={currentEditedTrainer} onClose={() => setCurrentEditor(undefined)} />,
    bagEntryNew: <BagEntryListEditor type="creation" trainer={currentEditedTrainer} onClose={() => setCurrentEditor(undefined)} />,
    bagEntryEdit: <BagEntryListEditor type="edit" trainer={currentEditedTrainer} index={currentBagEntry} />,
  };
  const deletions = {
    trainer: <TrainerDeletion type="trainer" onClose={onCloseDeletion} />,
    battler: <TrainerDeletion type="battler" battlerIndex={currentBattler.index} onClose={onCloseDeletion} />,
  };

  useEffect(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return;

    if (shortcut === StudioShortcut.DB_PREVIOUS) {
      setSelectedDataIdentifier({ trainer: getPreviousDbSymbol('id') });
    }
    if (shortcut === StudioShortcut.DB_NEXT) {
      setSelectedDataIdentifier({ trainer: getNextDbSymbol('id') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut, getPreviousDbSymbol, getNextDbSymbol, currentEditor, currentDeletion]);

  return (
    <DatabasePageStyle>
      <TrainerControlBar onChange={onChange} trainer={trainer} onClickNewTrainer={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <TrainerFrame
              trainer={trainer}
              onClick={() => setCurrentEditor('frame')}
              key={`${trainer.sprite(state.projectPath || '')}-${trainer.spriteBig(state.projectPath || '')}`}
            />
            <TrainerDialog trainer={trainer} onClick={() => setCurrentEditor('dialog')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonBattlerList
              title={t('trainer_party', { name: trainer.trainerName() })}
              onClickAdd={() => setCurrentEditor('battlerNew')}
              onClickDelete={onDeleteBattler}
              onClickImport={() => setCurrentEditor('battlerImport')}
              onEditPokemonProperty={(index, kind) => {
                setCurrentBattler({ index: index, kind: kind });
                setCurrentEditor('battlerEdit');
              }}
              pokemonBattlers={trainer.party}
              disabledImport={Object.entries(trainers).length <= 1}
            />
            <BagEntryList
              title={t('trainer_bag', { name: trainer.trainerName() })}
              onClickAdd={() => setCurrentEditor('bagEntryNew')}
              onClickDelete={onDeleteBagEntry}
              onClickImport={() => setCurrentEditor('bagEntryImport')}
              onClickEdit={onEditBagEntry}
              bagEntries={trainer.bagEntries}
              disabledImport={Object.entries(trainers).length <= 1}
            />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('deletion')}>
              <DeleteButtonWithIcon onClick={() => setCurrentDeletion('trainer')} disabled={Object.entries(trainers).length === 1}>
                {t('delete_this_trainer')}
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
