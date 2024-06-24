import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@hooks/usePage';
import { useProjectPokemon } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type CreatureDeletionProps = {
  closeDialog: () => void;
};

export const CreatureDeletion = forwardRef<EditorHandlingClose, CreatureDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creatureName } = useCreaturePage();
  const { projectDataValues: creatures, selectedDataIdentifier: currentPokemon, removeProjectDataValue: deletePokemon } = useProjectPokemon();
  const pokemon = useMemo(() => creatureName, []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(creatures)
      .map(([value, pokemonData]) => ({ value, index: pokemonData.id }))
      .filter((d) => d.value !== currentPokemon.specie)
      .sort((a, b) => a.index - b.index)[0].value;
    closeDialog();
    deletePokemon(currentPokemon.specie, { pokemon: { specie: firstDbSymbol, form: 0 } });
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of_pokemon', { pokemon })}
      message={t('deletion_message_pokemon', { pokemon })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
CreatureDeletion.displayName = 'CreatureDeletion';
