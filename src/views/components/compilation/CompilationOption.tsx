import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import React from 'react';
import { COMPILATION_DIALOG_SCHEMA, StudioOptionCompilation } from './CompilationDialogSchema';
import { useTranslation } from 'react-i18next';

type CompilationOptionProps = {
  option: StudioOptionCompilation;
  defaults: Record<string, unknown>;
};

export const CompilationOption = ({ option, defaults }: CompilationOptionProps) => {
  const { Toggle } = useInputAttrsWithLabel(COMPILATION_DIALOG_SCHEMA, defaults);
  const { t } = useTranslation('compilation');

  return (
    <div className="option">
      <div className="option-info">
        <span className="title">{t(`option_title_${option}`)}</span>
        <span className="description">{t(`option_desc_${option}`)}</span>
      </div>
      <div className="toggle">
        <Toggle name={option} />
      </div>
    </div>
  );
};
