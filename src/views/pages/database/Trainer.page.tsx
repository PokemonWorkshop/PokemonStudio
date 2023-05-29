import React, { useMemo, useState } from 'react';
import { DatabasePageStyle } from '@components/database/DatabasePageStyle';
import { PageContainerStyle, PageDataConstrainerStyle } from './PageContainerStyle';
import { useProjectPokemon, useProjectTrainers } from '@utils/useProjectData';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { useTranslation } from 'react-i18next';
import { DeletionOverlay } from '@components/deletion';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { DeleteButtonWithIcon } from '@components/buttons';
import { TrainerControlBar, TrainerDeletion, TrainerDialog, TrainerFrame } from '@components/database/trainer';
import { EditorOverlay } from '@components/editor';
import { TrainerImportEditor, TrainerDialogEditor, TrainerFrameEditor, TrainerNewEditor } from '@components/database/trainer/editors';
import { useGlobalState } from '@src/GlobalStateProvider';
import { PokemonBattlerList } from '@components/pokemonBattlerList';
import { PokemonBattlerListEditor } from '@components/pokemonBattlerList/editors';
import { CurrentBattlerType } from '@components/pokemonBattlerList/PokemonBattlerList';
import { BagEntryList, BagEntryListEditor } from '@components/bagEntryList';
import { useTranslationEditor } from '@utils/useTranslationEditor';
import { StudioShortcutActions, useShortcut } from '@utils/useShortcuts';
import { useGetEntityNameText, useGetProjectText } from '@utils/ReadingProjectText';
import {
  reduceBagEntries,
  TRAINER_CLASS_TEXT_ID,
  TRAINER_DEFEAT_SENTENCE_TEXT_ID,
  TRAINER_NAME_TEXT_ID,
  TRAINER_VICTORY_SENTENCE_TEXT_ID,
  updatePartyTrainerName,
} from '@modelEntities/trainer';
import { cleanExpandPokemonSetup, cleaningTrainerNaNValues } from '@utils/cleanNaNValue';
import { cloneEntity } from '@utils/cloneEntity';
import { trainerSpriteBigPath, trainerSpritePath } from '@utils/path';

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
  const getTrainerName = useGetEntityNameText();
  const getText = useGetProjectText();
  const onChange: SelectChangeEvent = (selected) => setSelectedDataIdentifier({ trainer: selected.value });
  const trainer = trainers[trainerDbSymbol];
  const currentEditedTrainer = useMemo(() => cloneEntity(trainer), [trainer]);
  const [currentEditor, setCurrentEditor] = useState<string | undefined>(undefined);
  const [currentDeletion, setCurrentDeletion] = useState<string | undefined>(undefined);
  const [currentBattler, setCurrentBattler] = useState<CurrentBattlerType>({
    index: undefined,
    kind: undefined,
  });
  const [currentBagEntry, setCurrentBagEntry] = useState<number | undefined>(undefined);
  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    if (currentEditor !== undefined || currentDeletion !== undefined) return {};

    return {
      db_previous: () => setSelectedDataIdentifier({ trainer: getPreviousDbSymbol('id') }),
      db_next: () => setSelectedDataIdentifier({ trainer: getNextDbSymbol('id') }),
      db_new: () => setCurrentEditor('new'),
    };
  }, [currentEditor, currentDeletion, setSelectedDataIdentifier, getPreviousDbSymbol, getNextDbSymbol]);

  useShortcut(shortcutMap);
  const [state] = useGlobalState();
  const { translationEditor, openTranslationEditor, closeTranslationEditor } = useTranslationEditor(
    {
      translation_name: { fileId: TRAINER_NAME_TEXT_ID },
      translation_class: { fileId: TRAINER_CLASS_TEXT_ID },
      translation_victory: { fileId: TRAINER_VICTORY_SENTENCE_TEXT_ID, isMultiline: true },
      translation_defeat: { fileId: TRAINER_DEFEAT_SENTENCE_TEXT_ID, isMultiline: true },
    },
    currentEditedTrainer.id,
    `${getText(TRAINER_CLASS_TEXT_ID, currentEditedTrainer.id)} ${getTrainerName(currentEditedTrainer)}`
  );

  const onCloseEditor = () => {
    if (
      currentEditor === 'frame' &&
      (getTrainerName(currentEditedTrainer) === '' ||
        getText(TRAINER_CLASS_TEXT_ID, currentEditedTrainer.id) === '' ||
        currentEditedTrainer.battlers.length === 0)
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
      cleanExpandPokemonSetup(currentEditedTrainer.party[currentBattler.index], species, false, state);
    if (currentEditor === 'bagEntryEdit') reduceBagEntries(currentEditedTrainer);
    updatePartyTrainerName(currentEditedTrainer, getTrainerName(currentEditedTrainer));
    cleaningTrainerNaNValues(currentEditedTrainer);
    if (currentEditor === 'battlerNew' || currentEditor === 'bagEntryNew') return setCurrentEditor(undefined);
    setTrainer({ [trainer.dbSymbol]: cloneEntity(currentEditedTrainer) });
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

  return (
    <DatabasePageStyle>
      <TrainerControlBar onChange={onChange} trainer={trainer} onClickNewTrainer={() => setCurrentEditor('new')} />
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <TrainerFrame
              trainer={trainer}
              onClick={() => setCurrentEditor('frame')}
              key={`${trainerSpritePath(trainer, state.projectPath || '')}-${trainerSpriteBigPath(trainer, state.projectPath || '')}`}
            />
            <TrainerDialog trainer={trainer} onClick={() => setCurrentEditor('dialog')} />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <PokemonBattlerList
              title={t('trainer_party', { name: getTrainerName(trainer) })}
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
              title={t('trainer_bag', { name: getTrainerName(trainer) })}
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
