import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deletion } from '@components/deletion';
import { useProjectGroups, useProjectPokemon } from '@utils/useProjectData';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { cloneEntity } from '@utils/cloneEntity';

type GroupDeletionProps = {
  type: 'group' | 'battler';
  battlerIndex?: number;
  onClose: () => void;
};

export const GroupDeletion = ({ type, battlerIndex, onClose }: GroupDeletionProps) => {
  const {
    projectDataValues: groups,
    selectedDataIdentifier: groupDbSymbol,
    setProjectDataValues: setGroup,
    removeProjectDataValue: removeGroup,
  } = useProjectGroups();
  const { projectDataValues: species } = useProjectPokemon();
  const { t } = useTranslation('database_groups');
  const getName = useGetEntityNameText();
  const group = groups[groupDbSymbol];
  const currentDeletedGroup = useMemo(() => cloneEntity(group), [group]);

  const onClickDelete = () => {
    if (type === 'group') {
      const firstDbSymbol = Object.entries(groups)
        .map(([value, groupData]) => ({ value, index: groupData.id }))
        .filter((d) => d.value !== groupDbSymbol)
        .sort((a, b) => a.index - b.index)[0].value;
      removeGroup(groupDbSymbol, { group: firstDbSymbol });
    } else if (type === 'battler' && battlerIndex != undefined) {
      currentDeletedGroup.encounters.splice(battlerIndex, 1);
      setGroup({ [group.dbSymbol]: currentDeletedGroup });
    }

    onClose();
  };

  return (
    <Deletion
      title={t(`${type}_deletion_of`)}
      message={t(`${type}_deletion_message`, {
        battler:
          battlerIndex != null && !!species[group.encounters[battlerIndex].specie]
            ? getName(species[group.encounters[battlerIndex].specie]).replaceAll(' ', '\u00a0')
            : '???',
        group: getName(group).replaceAll(' ', '\u00a0'),
      })}
      onClickDelete={onClickDelete}
      onClose={onClose}
    />
  );
};
