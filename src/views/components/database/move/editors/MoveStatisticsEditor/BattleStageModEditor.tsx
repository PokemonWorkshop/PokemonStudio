import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import React from 'react';
import { STATISTIC_EDITOR_SCHEMA } from './StatisticEditorSchema';

type BattleStageModEditorProps = {
  index: number;
  label: string;
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
};

export const BattleStageModEditor = ({ index, label, onTouched, defaults }: BattleStageModEditorProps) => {
  const { Input } = useInputAttrsWithLabel(STATISTIC_EDITOR_SCHEMA, defaults);

  return (
    <>
      <Input name={`battleStages.${index}.type`} style={{ display: 'none' }} />
      <Input name={`battleStages.${index}.value`} label={label} labelLeft onInput={onTouched} />
    </>
  );
};
