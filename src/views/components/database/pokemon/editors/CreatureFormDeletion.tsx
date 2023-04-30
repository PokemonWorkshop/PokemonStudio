import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { cloneEntity } from '@utils/cloneEntity';
import { useCreaturePage } from '@utils/usePage';
import { useProjectPokemon } from '@utils/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type CreatureFormDeletionProps = {
  closeDialog: () => void;
};

export const CreatureFormDeletion = forwardRef<EditorHandlingClose, CreatureFormDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const { projectDataValues: creatures, selectedDataIdentifier: currentPokemon, setProjectDataValues: setCreature } = useProjectPokemon();

  const onClickDelete = () => {
    const updatedCreature = cloneEntity(creature);
    updatedCreature.forms.splice(
      updatedCreature.forms.findIndex((f) => f.form === currentPokemon.form),
      1
    );
    closeDialog();
    setCreature({ [creature.dbSymbol]: updatedCreature }, { pokemon: { specie: currentPokemon.specie, form: 0 } });
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_form', { form: form.form })}
      message={t('deletion_message_form', { form: form.form })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
CreatureFormDeletion.displayName = 'CreatureFormDeletion';
