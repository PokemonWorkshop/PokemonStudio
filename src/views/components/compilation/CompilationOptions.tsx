import { CompilationOptionsContainer } from './CompilationDialogStyle';
import { CompilationOption } from './CompilationOption';
import type { StudioOptionCompilation } from './CompilationDialogSchema';
import { useTranslation } from 'react-i18next';
import React from 'react';

type CompilationOptionsProps = {
  defaults: Record<string, unknown>;
};

export const CompilationOptions = ({ defaults }: CompilationOptionsProps) => {
  const { t } = useTranslation('compilation');

  return (
    <CompilationOptionsContainer>
      <div className="options-title">{t('compilation_options')}</div>
      <div className="options">
        {(['updateVisual', 'updateData', 'updateLibraries', 'updateAudio', 'updateBinaries'] as StudioOptionCompilation[]).map((option) => (
          <CompilationOption option={option} defaults={defaults} key={`option-${option}`} />
        ))}
      </div>
    </CompilationOptionsContainer>
  );
};
