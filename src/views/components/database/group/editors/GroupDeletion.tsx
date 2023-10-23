import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectGroups } from '@utils/useProjectData';
import { getEntityNameText } from '@utils/ReadingProjectText';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';

type GroupDeletionProps = {
  closeDialog: () => void;
};

export const GroupDeletion = forwardRef<EditorHandlingClose, GroupDeletionProps>(({ closeDialog }, ref) => {
  const { projectDataValues: groups, selectedDataIdentifier: groupDbSymbol, removeProjectDataValue: deleteGroup, state } = useProjectGroups();
  const { t } = useTranslation('database_groups');
  const group = groups[groupDbSymbol];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const groupName = useMemo(() => getEntityNameText(group, state), []);

  useEditorHandlingClose(ref);

  const onClickDelete = () => {
    const firstDbSymbol = Object.entries(groups)
      .map(([value, groupData]) => ({ value, index: groupData.id }))
      .filter((d) => d.value !== groupDbSymbol)
      .sort((a, b) => a.index - b.index)[0].value;
    deleteGroup(groupDbSymbol, { group: firstDbSymbol });
    closeDialog();
  };

  return (
    <Deletion
      title={t(`group_deletion_of`)}
      message={t(`group_deletion_message`, { group: groupName.replaceAll(' ', '\u00a0') })}
      onClickDelete={onClickDelete}
      onClose={closeDialog}
    />
  );
});
GroupDeletion.displayName = 'GroupDeletion';
