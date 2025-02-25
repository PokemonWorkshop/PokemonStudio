import { useEditorHandlingCloseRef } from '@components/editor/useHandleCloseEditor';
import { DialogRefData } from '@hooks/useDialogsRef';
import React, { forwardRef, PropsWithoutRef, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

export const BackDrop = styled.div`
  display: none; /* Hidden by default */
  position: fixed;
  z-index: 99; /* Ensure the backdrop is just below the modal */
  left: 0;
  width: 100vw; /* Full viewport width */

  background-color: rgba(10, 9, 11, 0.3);
  top: ${({ theme }) => theme.calc.titleBarHeight};
  height: ${({ theme }) => theme.calc.height};

  &.open {
    display: block; /* Show the backdrop when open */
  }
`;

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

    &.open {
      transform: translateX(-100%);
      opacity: 1;
    }
  }

  &.open {
    display: block;
    z-index: 100;
  }

  &.center {
    opacity: 0;

    &.open {
      opacity: 1;
      top: 40%;
    }
  }

  & > div {
    left: unset;
    position: unset;
  }

  &:focus {
    outline: 0;
  }
`;

const onDialogCancel = (e: Event) => e.preventDefault();

const focusableHtmlElements = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

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

const closeDialogWithAnimation = (dialog: HTMLDialogElement, backdrop: HTMLDivElement, isCenter: boolean, onFinish: () => void) => {
  const animation = dialog.animate(isCenter ? animationKeys.center.close : animationKeys.right.close, animationOption);

  animation.onfinish = () => {
    dialog.classList.remove('open');
    backdrop.classList.remove('open');
    dialog.close();
    onFinish();
    dialog.removeEventListener('cancel', onDialogCancel);

    // If another dialogs is open, then focus the first focusable element in this modal
    const otherDialogs = document.querySelectorAll('dialog.open');
    if (otherDialogs.length) {
      const focusableElements = otherDialogs[otherDialogs.length - 1].querySelectorAll(focusableHtmlElements);
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  };
};

const openDialogWithAnimation = (dialog: HTMLDialogElement, backdrop: HTMLDivElement, isCenter: boolean) => {
  dialog.addEventListener('cancel', onDialogCancel);
  dialog.classList.add('open');
  backdrop.classList.add('open');
  dialog.animate(isCenter ? animationKeys.center.open : animationKeys.right.open, animationOption);

  setTimeout(() => {
    const focusableElements = dialog.querySelectorAll(focusableHtmlElements);
    if (focusableElements?.length) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, animationOption.duration);
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const defineEditorOverlay = <Keys extends string, Props extends Record<string, unknown> = {}>(
  displayName: string,
  renderInnerDialog: (
    dialogToShow: Keys,
    handleCloseRef: ReturnType<typeof useEditorHandlingCloseRef>,
    closeDialog: () => void,
    props: PropsWithoutRef<Props>
  ) => ReactNode
) => {
  const reactComponent = forwardRef<DialogRefData<Keys>, Props>((props, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const handleCloseRef = useEditorHandlingCloseRef();
    const [currentDialog, setCurrentDialog] = useState<Keys | undefined>(undefined);
    const [isCenter, setIsCenter] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    const closeDialog = () => {
      handleCloseRef.current?.onClose();
      if (dialogRef.current && backdropRef.current)
        closeDialogWithAnimation(dialogRef.current, backdropRef.current, isCenter, () => setCurrentDialog(undefined));
    };

    const currentlyRenderedDialog = useMemo(() => {
      if (!currentDialog) return null;
      return renderInnerDialog(currentDialog, handleCloseRef, closeDialog, props);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDialog, props]);

    const onEscape = () => {
      if (handleCloseRef.current?.canClose()) closeDialog();
    };

    const onClickOutside = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (e.currentTarget === e.target) onEscape();
    };

    const openDialog = (name: Keys, isCenterDialog?: boolean) => {
      setIsCenter(isCenterDialog || false);
      setCurrentDialog(name);
      // Without tick, if the dialog change between center and right, the dialog is not displayed correctly
      setTimeout(() => {
        if (dialogRef.current && backdropRef.current) openDialogWithAnimation(dialogRef.current, backdropRef.current, isCenterDialog || false);
      }, 0);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ closeDialog, openDialog: openDialog, currentDialog }), [currentDialog]);

    // Handle user pressing the escape key
    useEffect(() => {
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && currentDialog) {
          event.preventDefault();
          onEscape();
        }
      };
      window.addEventListener('keydown', handleKey);

      return () => window.removeEventListener('keydown', handleKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDialog]);

useEffect(() => {
  const handleTabKey = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const openDialogs = document.querySelectorAll('dialog.open');
    if (openDialogs.length === 0) return;

    const lastDialog = openDialogs[openDialogs.length - 1] as HTMLDialogElement;
    if (!lastDialog.contains(event.target as Node)) return;

    const focusableElements = Array.from(lastDialog.querySelectorAll(focusableHtmlElements)) as HTMLElement[];
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {

      if (document.activeElement === firstElement) {
        event.preventDefault();
        if (focusableElements[focusableElements.length - 2].getAttribute('type') === 'hidden') {
          const lastFocusableElement = focusableElements
            .reverse()
            .find((el) => el.getAttribute('type') !== 'hidden' && el.getAttribute('aria-hidden') !== 'true');
          lastFocusableElement?.focus();
        } else {
          focusableElements[focusableElements.length - 2].focus();
        }
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        focusableElements[1].focus();
      }
    }
  };

        const handleCtrlA = (event: KeyboardEvent) => {
          if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
            const openDialogs = document.querySelectorAll('dialog.open');
            if (openDialogs.length === 0) return;

            const lastDialog = openDialogs[openDialogs.length - 1] as HTMLDialogElement;
            if (lastDialog.contains(event.target as Node)) {
              event.preventDefault();
              const target = event.target as HTMLElement;

              if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                (target as HTMLInputElement | HTMLTextAreaElement).select();
              } else {
                const range = document.createRange();
                range.selectNodeContents(lastDialog);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            }
          }
        };

        window.addEventListener('keydown', handleCtrlA);
        window.addEventListener('keydown', handleTabKey);
        return () => {
          window.removeEventListener('keydown', handleCtrlA);
          window.removeEventListener('keydown', handleTabKey);
        };
}, [currentDialog]);

return createPortal(
  <>
    <BackDrop ref={backdropRef} onClick={onClickOutside}></BackDrop>
    <DialogContainer ref={dialogRef} className={isCenter ? 'center' : 'right'}>
      <div
        tabIndex={0}
        aria-hidden="true"
        onFocus={(e) => {
          const focusableElements = Array.from(dialogRef.current?.querySelectorAll(focusableHtmlElements) || []) as HTMLElement[];
          if (focusableElements.length > 0 && e.relatedTarget === focusableElements[focusableElements.length - 1]) {
            requestAnimationFrame(() => focusableElements[0].focus());
          }
        }}
      ></div>

      {currentlyRenderedDialog}

      <div
        tabIndex={0}
        aria-hidden="true"
        onFocus={(e) => {
          const focusableElements = Array.from(dialogRef.current?.querySelectorAll(focusableHtmlElements) || []) as HTMLElement[];
          if (focusableElements.length > 0 && e.relatedTarget === focusableElements[0]) {
            requestAnimationFrame(() => focusableElements[focusableElements.length - 1].focus());
          }
        }}
      ></div>
    </DialogContainer>
  </>,
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
