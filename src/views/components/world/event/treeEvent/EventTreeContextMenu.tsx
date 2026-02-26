import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import EditIcon from '@assets/icons/global/edit-icon.svg';
import { EventDialogsRef } from '../editors/EventEditorOverlay';
import { StudioEventTreeValue } from '../../../../../models/entities/event/event-tree';

type EventTreeContextMenuProps = {
  eventValue: StudioEventTreeValue;
  isDeleted: boolean;
  enableRename: () => void;
  dialogsRef: EventDialogsRef;
};

export const EventTreeContextMenu = ({ eventValue: eventValue, isDeleted, enableRename, dialogsRef }: EventTreeContextMenuProps) => {
  const { t } = useTranslation();

  const isFolder = eventValue.data?.klass === 'EventFolder';

  const onClickDelete = () => {
    if (isFolder) {
      dialogsRef?.current?.openDialog('deletion_folder', true);
    } else {
      dialogsRef?.current?.openDialog('deletion_event', true);
    }
  };

  return (
    <>
      {!isDeleted && (
        <div onClick={() => enableRename()}>
          <span className="icon">
            <EditIcon />
          </span>
          {t('rename')}
        </div>
      )}
      <div className="delete" onClick={onClickDelete}>
        <span className="icon">
          <DeleteIcon />
        </span>
        {t('delete')}
      </div>
    </>
  );
};
