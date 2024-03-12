import React from 'react';
import { ReactNode, useEffect } from 'react';

type ToolTipContextProps = {
  children: ReactNode;
};

const isTargetElementShowingToolTip = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) return false;

  const dataset = target.dataset;
  if ('toolTipHidden' in dataset) return false;
  if (('toolTip' in dataset && dataset.toolTip !== undefined) || ('toolTipId' in dataset && dataset.toolTipId !== undefined)) return true;
  if (target.offsetWidth >= target.scrollWidth) return false;

  const styles = target.computedStyleMap();
  const overflow = styles.get('text-overflow');

  return overflow !== undefined && 'value' in overflow && overflow.value === 'ellipsis';
};

const TOOLTIP_VERTICAL_SPACING = 2;

const placeToolTip = (container: HTMLElement, target: HTMLElement) => {
  // Reset container position so we can accurately compute width & height
  container.style.top = '0';
  container.style.left = '0';
  // Get all required coordinates
  const clientPos = target.getBoundingClientRect();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // If target position < toolTip required space, show tooltip below
  if (clientPos.top < containerHeight + TOOLTIP_VERTICAL_SPACING) {
    container.style.top = `${clientPos.top + clientPos.height + TOOLTIP_VERTICAL_SPACING}px`;
  } else {
    container.style.top = `${clientPos.top - containerHeight - TOOLTIP_VERTICAL_SPACING}px`;
  }

  // If target position too close to window right, show aligned with right side of target
  if (clientPos.left + containerWidth > window.innerWidth) {
    container.style.left = `${clientPos.right - containerWidth}px`;
  } else {
    container.style.left = `${clientPos.left}px`;
  }
};

const displayToolTipData = (container: HTMLElement, target: HTMLElement) => {
  const dataset = target.dataset;

  if ('toolTip' in dataset && dataset.toolTip) {
    container.innerText = dataset.toolTip;
  } else if ('toolTipId' in dataset && dataset.toolTipId) {
    const toolTipContent = document.getElementById(dataset.toolTipId);
    if (toolTipContent) {
      container.innerHTML = toolTipContent.innerHTML;
    } else {
      container.innerText = `Failed to fetch content of #${dataset.toolTipId}`;
    }
  } else if (target instanceof HTMLInputElement) {
    container.innerText = target.value;
  } else {
    container.innerText = target.innerText;
  }
};

export const ToolTipContext = ({ children }: ToolTipContextProps) => {
  const toolTipContainer = document.getElementById('tooltipContainer');
  if (!toolTipContainer) throw new Error('#tooltipContainer must exist in the DOM in order to show toolTips.');

  let popoverEntity: HTMLElement | null = null;

  const onMouseOver = (e: MouseEvent) => {
    const target = e.target;
    if (!isTargetElementShowingToolTip(target)) return;

    popoverEntity = target;
    displayToolTipData(toolTipContainer, target);
    toolTipContainer.showPopover();
    placeToolTip(toolTipContainer, target);
    toolTipContainer.classList.add('visible');
  };

  const onMouseOut = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement) || e.target !== popoverEntity) return;

    toolTipContainer.innerText = '';
    toolTipContainer.classList.remove('visible');
    toolTipContainer.hidePopover();
    popoverEntity = null;
  };

  useEffect(() => {
    window.addEventListener('mouseover', onMouseOver, { capture: true, passive: true });
    window.addEventListener('mouseout', onMouseOut, { capture: true, passive: true });
    window.addEventListener('mousedown', onMouseOut, { capture: true, passive: true });
    return () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('mousedown', onMouseOut);
    };
  }, []);

  return <>{children}</>;
};