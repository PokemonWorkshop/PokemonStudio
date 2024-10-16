import { MOVE_STATUS_CUSTOM, MOVE_STATUS_LIST, StudioMoveStatusList } from '@modelEntities/move';
import { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusEditor } from './StatusEditor';

type StatusesEditorProps = {
  onTouched: (event: React.FormEvent<HTMLInputElement>, index: number) => void;
  defaults: Record<string, unknown>;
  statuses: StudioMoveStatusList[];
  chances: number[];
  handleStatusChange: (index: number, value: string) => void;
  handleChancesChange: (index: number, chance: number) => void;
  getRawFormData: () => Record<string, unknown>;
};

const moveStatusEntries = (t: TFunction<'database_moves', undefined>) => [
  { value: '__undef__', label: t('none') },
  ...MOVE_STATUS_LIST.map((status) => ({
    value: status,
    label: t(status),
  })).sort((a, b) => a.label.localeCompare(b.label)),
  { value: MOVE_STATUS_CUSTOM, label: t('custom') },
];

export const StatusesEditor = ({
  onTouched,
  defaults,
  statuses,
  chances,
  handleStatusChange,
  handleChancesChange,
  getRawFormData,
}: StatusesEditorProps) => {
  const { t } = useTranslation('database_moves');

  return (
    <>
      {[0, 1, 2].map((index) => (
        <StatusEditor
          index={index}
          options={moveStatusEntries(t)}
          getRawFormData={getRawFormData}
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
