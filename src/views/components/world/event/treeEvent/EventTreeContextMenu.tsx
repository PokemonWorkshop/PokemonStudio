import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@assets/icons/global/delete-icon.svg';
import EditIcon from '@assets/icons/global/edit-icon.svg';
import { EventDialogsRef } from '../editors/EventEditorOverlay';
import { StudioEventTreeValue } from '@modelEntities/event/event-tree';
import { useEventTree } from '@src/hooks/useEventTree';
import { removeEventTreeItem } from '@utils/events/EventUtils';
import { DbSymbol } from '@modelEntities/dbSymbol';

type EventTreeContextMenuProps = {
  eventValue: StudioEventTreeValue;
  isDeleted: boolean;
  enableRename: () => void;
  dialogsRef: EventDialogsRef;
};

export const EventTreeContextMenu = ({ eventValue: eventValue, isDeleted, enableRename, dialogsRef }: EventTreeContextMenuProps) => {
  const { t } = useTranslation();
  const { eventTree, setEventTree } = useEventTree();
  const isFolder = eventValue.data?.klass === 'EventFolder';

  const onClickDelete = () => {
    if (isFolder) {
      if (eventValue.children.length === 0) {
        setEventTree(removeEventTreeItem(eventTree, eventValue.id as DbSymbol));
      } else {
        dialogsRef?.current?.openDialog('deletion_folder', true);
      }
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
