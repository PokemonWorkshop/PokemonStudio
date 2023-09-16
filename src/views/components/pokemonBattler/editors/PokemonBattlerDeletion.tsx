import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { Deletion } from '@components/deletion';
import { useProjectPokemon } from '@utils/useProjectData';
import { useGroupPage, useTrainerPage } from '@utils/usePage';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { useUpdateTrainer } from '@components/database/trainer/editors/useUpdateTrainer';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateGroup } from '@components/database/group/editors/useUpdateGroup';
import { assertUnreachable } from '@utils/assertUnreachable';
import type { PokemonBattlerFrom } from './PokemonBattlerEditorOverlay';
import type { StudioGroup } from '@modelEntities/group';
import type { StudioTrainer } from '@modelEntities/trainer';

const getEncounters = (from: PokemonBattlerFrom, index: number, trainer: StudioTrainer, group: StudioGroup) => {
  switch (from) {
    case 'group':
      return group.encounters[index].specie;
    case 'trainer':
      return trainer.party[index].specie;
    default:
      assertUnreachable(from);
  }
  return '__undef__';
};

type PokemonBattlerDeletionProps = {
  closeDialog: () => void;
  index: number;
  from: PokemonBattlerFrom;
};

export const PokemonBattlerDeletion = forwardRef<EditorHandlingClose, PokemonBattlerDeletionProps>(({ closeDialog, index, from }, ref) => {
  const { projectDataValues: creatures, state } = useProjectPokemon();
  const { trainer, trainerName } = useTrainerPage();
  const { group, groupName } = useGroupPage();
  const updateTrainer = useUpdateTrainer(trainer);
  const updateGroup = useUpdateGroup(group);
  const { t } = useTranslation(['database_trainers', 'database_groups']);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const creature = useMemo(() => creatures[getEncounters(from, index, trainer, group)], []);
  const battlerName = creature ? getEntityNameText(creature, state).replaceAll(' ', '\u00a0') : '???';

  const getMessage = () => {
    switch (from) {
      case 'group':
        return t('database_groups:battler_deletion_message', { battler: battlerName, group: groupName });
      case 'trainer':
        return t('database_trainers:battler_deletion_message', { battler: battlerName, trainer: trainerName });
      default:
        assertUnreachable(from);
    }
    return '';
  };

  const onClickDelete = () => {
    switch (from) {
      case 'group': {
        const cloneEncounters = cloneEntity(group.encounters);
        cloneEncounters.splice(index, 1);
        updateGroup({ encounters: cloneEncounters });
        break;
      }
      case 'trainer': {
        const cloneParty = cloneEntity(trainer.party);
        cloneParty.splice(index, 1);
        updateTrainer({ party: cloneParty });
        break;
      }
      default:
        assertUnreachable(from);
    }
    closeDialog();
  };

  useEditorHandlingClose(ref);

  return <Deletion title={t('database_trainers:battler_deletion_of')} message={getMessage()} onClickDelete={onClickDelete} onClose={closeDialog} />;
});
PokemonBattlerDeletion.displayName = 'PokemonBattlerDeletion';
