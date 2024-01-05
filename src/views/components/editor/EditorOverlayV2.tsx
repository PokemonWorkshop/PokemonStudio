import { useEditorHandlingCloseRef } from '@components/editor/useHandleCloseEditor';
import { DialogRefData } from '@utils/useDialogsRef';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

export const DialogContainer = styled.dialog`
  overflow: visible;
  padding: 0;
  border: 0;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text100};

  &.right {
    margin: 0;
    top: ${({ theme }) => theme.calc.titleBarHeight};
    height: ${({ theme }) => theme.calc.height};
    left: 100%;
  }

  &.center {
    opacity: 0;
  }

  & > div {
    left: unset;
    position: unset;
  }

  &::backdrop {
    background-color: rgba(10, 9, 11, 0.3);
    top: ${({ theme }) => theme.calc.titleBarHeight};
    height: ${({ theme }) => theme.calc.height};
  }

  &.right[open] {
    transform: translateX(-100%);
  }

  &.center[open] {
    opacity: 1;
  }

  &:focus {
    outline: 0;
  }
`;

const onDialogCancel = (e: Event) => e.preventDefault();

const animationKeys = {
  right: {
    open: [
      { offset: 0, transform: 'translateX(0)' },
      { offset: 0.25, transform: 'translateX(0)' },
      { offset: 1, transform: 'translateX(-100%)' },
    ],
    close: [
      { offset: 0, transform: 'translateX(-100%)' },
      { offset: 0.25, transform: 'translateX(-100%)' },
      { offset: 1, transform: 'translateX(0)' },
    ],
  },
  center: {
    open: [
      { offset: 0, opacity: 0 },
      { offset: 0.25, opacity: 0 },
      { offset: 1, opacity: 1 },
    ],
    close: [
      { offset: 0, opacity: 1 },
      { offset: 0.25, opacity: 1 },
      { offset: 1, opacity: 0 },
    ],
  },
};

const animationOption = {
  duration: 200,
  easing: 'ease-in',
} as const;

const closeDialogWithAnimation = (dialog: HTMLDialogElement, isCenter: boolean, onFinish: () => void) => {
  const animation = dialog.animate(isCenter ? animationKeys.center.close : animationKeys.right.close, animationOption);
  animation.onfinish = () => {
    onFinish();
    dialog.close();
    dialog.removeEventListener('cancel', onDialogCancel);
  };
};

const openDialogWithAnimation = (dialog: HTMLDialogElement, isCenter: boolean) => {
  dialog.addEventListener('cancel', onDialogCancel);
  dialog.showModal();
  dialog.animate(isCenter ? animationKeys.center.open : animationKeys.right.open, animationOption);
};

/**
 * Generic editor overlay to extend with a proper rendering definition.
 *
 * This generic editor overlay editor assign a DialogsRef allow other components to open/close dialogs.
 * The possible dialogs are defined with the template Keys parameter.
 * The dialogsRef is set by this component but needs to be created using useRef in the component rendering the overlay (see example).
 * @example
 * // In definition file
 * export const AbilityEditorOverlay = defineEditorOverlay<AbilityEditorAndDeletionKeys, Props>(
 *   'AbilityEditorOverlay',
 *   (dialogToShow, handleCloseRef, closeDialog, { onTranslationClose }) => {
 *     switch (dialogToShow) {
 *       case 'new':
 *         return <AbilityNewEditor closeDialog={closeDialog} ref={handleCloseRef} />;
 *       case 'frame':
 *         return <AbilityFrameEditor onTranslationClose={onTranslationClose} ref={handleCloseRef} />;
 *       case 'deletion':
 *         return <AbilityDeletion closeDialog={closeDialog} ref={handleCloseRef} />;
 *       default:
 *         return assertUnreachable(dialogToShow);
 *     }
 *   }
 * );
 * // In Page File
 * const dialogsRef = useDialogsRef<AbilityEditorAndDeletionKeys>();
 * // [...]
 *   <AbilityEditorOverlay onTranslationClose={doSomething} ref={dialogsRef} />
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const defineEditorOverlay = <Keys extends string, Props extends Record<string, unknown> = {}>(
  displayName: string,
  renderInnerDialog: (
    dialogToShow: Keys,
    handleCloseRef: ReturnType<typeof useEditorHandlingCloseRef>,
    closeDialog: () => void,
    props: Props
  ) => React.ReactChild
) => {
  const reactComponent = forwardRef<DialogRefData<Keys>, Props>((props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const handleCloseRef = useEditorHandlingCloseRef();
    const [currentDialog, setCurrentDialog] = useState<Keys | undefined>(undefined);
    const [isCenter, setIsCenter] = useState(false);

    const closeDialog = () => {
      handleCloseRef.current?.onClose();
      if (dialogRef.current) closeDialogWithAnimation(dialogRef.current, isCenter, () => setCurrentDialog(undefined));
    };

    const currentlyRenderedDialog = useMemo(() => {
      if (!currentDialog) return null;
      return renderInnerDialog(currentDialog, handleCloseRef, closeDialog, props);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDialog, props]);

    const onEscape = () => {
      if (handleCloseRef.current?.canClose()) closeDialog();
    };

    const onClickOutside = (e: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
      if (e.currentTarget === e.target) onEscape();
    };

    const openDialog = (name: Keys, isCenterDialog?: boolean) => {
      setIsCenter(isCenterDialog || false);
      setCurrentDialog(name);
      if (dialogRef.current) openDialogWithAnimation(dialogRef.current, isCenterDialog || false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ closeDialog, openDialog: openDialog, currentDialog }), [currentDialog]);

    // Handle user pressing the escape key
    useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && currentDialog) onEscape();
      };
      window.addEventListener('keydown', handleKey);

      return () => window.removeEventListener('keydown', handleKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDialog]);

    return ReactDOM.createPortal(
      <DialogContainer ref={dialogRef} onClick={onClickOutside} className={isCenter ? 'center' : 'right'}>
        {currentlyRenderedDialog}
      </DialogContainer>,
      document.querySelector('#dialogs') || document.createElement('div')
    );
  });
  reactComponent.displayName = displayName;
  return reactComponent;
};

export const editorOverlayHidden = (hidden: boolean) => {
  const dialog = document.getElementById('dialogs');
  if (dialog) dialog.hidden = hidden;
};
