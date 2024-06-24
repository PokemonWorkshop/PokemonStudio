import { Deletion } from '@components/deletion';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { getEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectAbilities } from '@hooks/useProjectData';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type AbilityDeletionProps = {
  closeDialog: () => void;
};

/**
 * Component responsive of asking the user if they really want to delete the ability before doing so.
 */
export const AbilityDeletion = forwardRef<EditorHandlingClose, AbilityDeletionProps>(({ closeDialog }, ref) => {
  const { t } = useTranslation('database_abilities');
  const { projectDataValues: abilities, selectedDataIdentifier: dbSymbol, removeProjectDataValue: deleteAbility, state } = useProjectAbilities();
  const ability = abilities[dbSymbol];
  // We memoise the ability name because when this dialog closes, the ability is already deleted and it shows another name than the one we deleted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const abilityName = useMemo(() => getEntityNameTextUsingTextId(ability, state), []);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(abilities)
      .map(([value, abilityData]) => ({ value, index: getEntityNameTextUsingTextId(abilityData, state) }))
      .filter((d) => d.value !== dbSymbol)
      .sort((a, b) => a.index.localeCompare(b.index))[0].value;
    closeDialog();
    deleteAbility(dbSymbol, { ability: firstDbSymbol });
  };

  // This component can be cancelled under no conditions and don't need to handle anything for the close behavior
  useEditorHandlingClose(ref);

  return (
    <Deletion
      title={t('deletion_of', { ability: abilityName })}
      message={t('deletion_message', { ability: abilityName })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
AbilityDeletion.displayName = 'AbilityDeletion';
