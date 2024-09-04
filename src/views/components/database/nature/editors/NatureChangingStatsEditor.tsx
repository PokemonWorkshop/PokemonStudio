import React, { forwardRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { useNaturePage } from '@hooks/usePage';
import { useUpdateNature } from './useUpdateNature';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputContainer, InputFormContainer } from '@components/inputs/InputContainer';
import { z } from 'zod';
import { NATURE_VALIDATOR, STUDIO_NATURE_STATS_LIST, StudioNature, StudioNatureStats } from '@modelEntities/nature';
import { cloneEntity } from '@utils/cloneEntity';

const CHANGING_STATS_EDITOR_SCHEMA = NATURE_VALIDATOR.extend({
  stats: z.object({
    atk: z.number().min(-99).max(899),
    dfe: z.number().min(-99).max(899),
    ats: z.number().min(-99).max(899),
    dfs: z.number().min(-99).max(899),
    spd: z.number().min(-99).max(899),
  }),
}).pick({ stats: true });

const updateStatsForEditor = (nature: StudioNature) => {
  const clonedNature = cloneEntity(nature);
  STUDIO_NATURE_STATS_LIST.forEach((stat) => (clonedNature.stats[stat] -= 100));
  return clonedNature;
};

const updateStatsForNatureEntity = (stats: StudioNatureStats) => {
  const clonedStats = cloneEntity(stats);
  STUDIO_NATURE_STATS_LIST.forEach((stat) => (clonedStats[stat] += 100));
  return clonedStats;
};

export const NatureChangingStatsEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_natures');
  const { nature } = useNaturePage();
  const updateNature = useUpdateNature(nature);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(CHANGING_STATS_EDITOR_SCHEMA, updateStatsForEditor(nature));
  const { EmbeddedUnitInput } = useInputAttrsWithLabel(CHANGING_STATS_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      updateNature({ stats: updateStatsForNatureEntity(result.data.stats) });
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('changing_stats')}>
      <InputFormContainer ref={formRef} size="xs">
        {STUDIO_NATURE_STATS_LIST.map((stat) => (
          <EmbeddedUnitInput
            name={`stats.${stat}`}
            label={t(`changing_stat_${stat}`)}
            labelLeft
            onInput={onInputTouched}
            key={`changing_stat_${stat}`}
          />
        ))}
      </InputFormContainer>
    </Editor>
  );
});
NatureChangingStatsEditor.displayName = 'NatureChangingStatsEditor';
