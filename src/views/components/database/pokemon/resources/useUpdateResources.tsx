import { StudioCreature, StudioCreatureForm } from '@modelEntities/creature';
import { useUpdateForm } from '../editors/useUpdateForm';
import { CreatureFormResourcesPath, basename } from '@utils/path';

export const useUpdateResources = (creature: StudioCreature, form: StudioCreatureForm) => {
  const updateForm = useUpdateForm(creature, form);

  const onResourceChoosen = (resourcePath: string, resource: CreatureFormResourcesPath) => {
    updateForm({
      resources: {
        ...form.resources,
        [resource]: basename(resourcePath, '.png').replace(/\.gif$/, ''),
      },
    });
  };

  const onResourceClean = (resource: CreatureFormResourcesPath) => {
    updateForm({
      resources: {
        ...form.resources,
        [resource]: '',
      },
    });
  };

  const onCryChoosen = (resourcePath: string) => {
    updateForm({
      resources: {
        ...form.resources,
        cry: basename(resourcePath),
      },
    });
  };

  const onShowFemale = (hasFemale: boolean) => updateForm({ resources: { ...form.resources, hasFemale } });

  return {
    onResourceChoosen,
    onResourceClean,
    onCryChoosen,
    onShowFemale,
  };
};
