import { MOVE_STATUS_LIST, StudioMoveStatusList } from '@modelEntities/move';
import { TFunction } from 'i18next';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusEditor } from './StatusEditor';

type StatusesEditorProps = {
  onTouched: (event: React.FormEvent<HTMLInputElement>, index: number) => void;
  defaults: Record<string, unknown>;
  statuses: StudioMoveStatusList[];
  chances: number[];
  handleStatusChange: (index: number, value: string) => void;
  handleChancesChange: (index: number, chance: number) => void;
};

const moveStatusEntries = (t: TFunction<'database_moves'>) => [
  { value: '__undef__', label: t('none') },
  { value: 'status_custom', label: t('status_custom') },
  ...MOVE_STATUS_LIST.map((status) => ({
    value: status,
    label: t(status),
  })),
  // .sort((a, b) => a.label.localeCompare(b.label)),
];

export const StatusesEditor = ({ onTouched, defaults, statuses, chances, handleStatusChange, handleChancesChange }: StatusesEditorProps) => {
  const { t } = useTranslation('database_moves');
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);

  return (
    <>
      {[0, 1, 2].map((index) => (
        <StatusEditor
          index={index}
          options={statusOptions}
          onTouched={onTouched}
          defaults={defaults}
          statuses={statuses}
          chances={chances}
          handleStatusChange={handleStatusChange}
          handleChancesChange={handleChancesChange}
          key={`status-editor-${index}`}
        />
      ))}
    </>
  );
};
