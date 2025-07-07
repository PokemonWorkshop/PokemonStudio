import { defineEditorOverlay } from '@components/editor/EditorOverlayV2';
import { assertUnreachable } from '@utils/assertUnreachable';
import { DialogRefData } from '@hooks/useDialogsRef';
import React from 'react';

import { DashboardSoundEditor } from './DashboardSoundEditor';
import { AudioFile } from '@modelEntities/common';
import { SoundEffectsKeys, SoundLocated } from '@modelEntities/config';

export type SoundEditorKeys =
    'sound_effect' | 'music';
export type SoundDialogRef = React.RefObject<DialogRefData<SoundEditorKeys>>;

export const SoundEditorOverlay = defineEditorOverlay<
  SoundEditorKeys,
  {
    audioFile: (AudioFile & { key: SoundEffectsKeys; located: SoundLocated }) | undefined;
  }
>('SoundEditorOverlay', (dialogToShow, handleCloseRef, closeDialog, props) => {
  switch (dialogToShow) {
    case 'music':
    case 'sound_effect':
      return <DashboardSoundEditor audioFile={props.audioFile} ref={handleCloseRef} />;
    default:
      return assertUnreachable(dialogToShow);
  }
});
