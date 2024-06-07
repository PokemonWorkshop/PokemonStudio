import { MOVE_STATUS_LIST } from '@modelEntities/move';
import { TFunction } from 'i18next';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusEditor } from './StatusEditor';

type StatusesEditorProps = {
  getRawFormData: () => Record<string, unknown>;
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
};

const moveStatusEntries = (t: TFunction<'database_moves'>) => [
  { value: '__undef__', label: t('none') },
  ...MOVE_STATUS_LIST.map((status) => ({
    value: status,
    label: t(status),
  })).sort((a, b) => a.label.localeCompare(b.label)),
];

export const StatusesEditor = ({ getRawFormData, onTouched, defaults }: StatusesEditorProps) => {
  const { t } = useTranslation('database_moves');
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);
  const [updateStatus, setUpdateStatus] = useState<boolean>(false);

  return (
    <>
      {[0, 1, 2].map((index) => (
        <StatusEditor
          index={index}
          options={statusOptions}
          getRawFormData={getRawFormData}
          onTouched={onTouched}
          defaults={defaults}
          updateStatus={updateStatus}
          setUpdateStatus={setUpdateStatus}
          key={`status-editor-${index}`}
        />
      ))}
    </>
  );
};
