import React, { ReactNode, MouseEvent, useState, useEffect, useRef, RefObject } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';

const ContextMenuContainer = styled.div`
  visibility: hidden;
  position: absolute;
  top: 0;
  z-index: 10000;
  display: flex;
  min-width: 160px;
  padding: 8px;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.dark8};
  ${({ theme }) => theme.fonts.normalRegular}
  user-select: none;

  div {
    display: flex;
    padding: 8px;
    gap: 4px;
    align-self: stretch;
    color: ${({ theme }) => theme.colors.text400};

    :hover {
      border-radius: 4px;
      background: ${({ theme }) => theme.colors.dark12};
      cursor: pointer;
    }
  }

  .delete {
    color: ${({ theme }) => theme.colors.dangerBase};
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    width: 18px;
  }
`;

type ContextMenuStyles = {
  top?: number;
  left?: number;
  bottom?: number;
  visibility?: 'visible';
};

const computePosition = <U extends HTMLElement>(e: MouseEvent<U>, height: number, followMouse?: boolean): ContextMenuStyles => {
  // Get screen accurate coordinate of currentTarget
  const rect = followMouse ? DOMRectReadOnly.fromRect({ x: e.clientX, y: e.clientY }) : e.currentTarget.getBoundingClientRect();

  // Compute all required variables
  const top = Math.floor(rect.bottom) + 4;
  const left = Math.floor(rect.left);

  // Test if the context menu is outside of the window
  if (top + height > window.innerHeight) {
    const newTop = Math.floor(rect.top) - height - 4;
    return { top: newTop, left, visibility: 'visible' };
  } else {
    return { top, left, visibility: 'visible' };
  }
};

const closeOtherContextMenu = (ref: RefObject<HTMLDivElement>) => {
  const event = new CustomEvent('close-other-context-menu', { detail: ref });
  window.dispatchEvent(event);
};

/**
 * Hook helping to show context menu properly
 * @example
 * const { buildOnClick, renderContextMenu } = useContextMenu();
 *
 * return (
 *  <SomeComplexPage onScroll={emitScrollContextMenu}>
 *    <SomeElementRequiringContextMenu onClick={buildOnClick} />
 *    {renderContextMenu(<CustomContextMenu />)}
 *  </SomeComplexPage>
 * )
 */
export const useContextMenu = <U extends HTMLElement>() => {
  const [contextMenuStyles, setContextMenuStyles] = useState<ContextMenuStyles>();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventListener = () => {
      if (!contextMenuStyles?.visibility) return;

      setContextMenuStyles({ visibility: undefined });
    };
    const closeOtherListener = (e: Event) => {
      const customEvent = e as CustomEvent<RefObject<HTMLDivElement>>;

      if (customEvent.detail.current !== contextMenuRef.current && contextMenuStyles?.visibility) {
        setContextMenuStyles({ visibility: undefined });
      }
    };
    window.addEventListener('click', eventListener);
    window.addEventListener('scroll-context-menu', eventListener);
    window.addEventListener('close-other-context-menu', (e) => closeOtherListener(e));
    return () => {
      window.removeEventListener('click', eventListener);
      window.removeEventListener('scroll-context-menu', eventListener);
      window.removeEventListener('close-other-context-menu', closeOtherListener);
    };
  }, [contextMenuStyles]);

  return {
    buildOnClick: (e: MouseEvent<U>, followMouse?: boolean) => {
      e.stopPropagation();
      if (contextMenuStyles?.visibility) {
        setContextMenuStyles({ visibility: undefined });
      } else {
        setContextMenuStyles(computePosition(e, contextMenuRef.current?.clientHeight || 0, followMouse));
        closeOtherContextMenu(contextMenuRef);
      }
    },
    renderContextMenu: (children: ReactNode) =>
      createPortal(
        <ContextMenuContainer style={contextMenuStyles} ref={contextMenuRef}>
          {children}
        </ContextMenuContainer>,
        document.querySelector('#context-menu') || document.createElement('div')
      ),
  };
};

export const emitScrollContextMenu = () => {
  const event = new CustomEvent('scroll-context-menu');
  window.dispatchEvent(event);
};
