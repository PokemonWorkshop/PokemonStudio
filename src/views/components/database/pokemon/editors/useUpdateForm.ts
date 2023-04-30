import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { cloneEntity } from '@utils/cloneEntity';
import { useProjectPokemon } from '@utils/useProjectData';
import { useCallback } from 'react';

export const useUpdateForm = (creature: StudioCreature, form: StudioCreatureForm) => {
  const { setProjectDataValues: setCreature } = useProjectPokemon();

  return useCallback(
    (updates: Partial<StudioCreatureForm>) => {
      const updatedForm = {
        ...cloneEntity(form),
        ...updates,
      };
      const updatedCreature = cloneEntity(creature);
      updatedCreature.forms[creature.forms.indexOf(form)] = updatedForm;
      setCreature({ [creature.dbSymbol]: updatedCreature });
    },
    [form]
  );
};
