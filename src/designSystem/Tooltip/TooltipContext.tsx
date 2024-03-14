import React from 'react';
import { ReactNode, useEffect } from 'react';

type TooltipContextProps = {
  children: ReactNode;
};

const isTargetElementShowingTooltip = (target: EventTarget | null): target is HTMLElement => {
  if (!(target instanceof HTMLElement)) return false;

  const dataset = target.dataset;
  if ('tooltipHidden' in dataset) return false;
  if (('tooltip' in dataset && dataset.tooltip !== undefined) || ('tooltipId' in dataset && dataset.tooltipId !== undefined)) return true;
  if ('tooltipResponsive' in dataset && dataset.tooltipResponsive !== undefined) return target.innerText !== dataset.tooltipResponsive;
  if (target.offsetWidth >= target.scrollWidth) return false;

  const styles = target.computedStyleMap();
  const overflow = styles.get('text-overflow');

  return overflow !== undefined && 'value' in overflow && overflow.value === 'ellipsis';
};

const TOOLTIP_VERTICAL_SPACING = 2;

const placeTooltip = (container: HTMLElement, target: HTMLElement) => {
  // Reset container position so we can accurately compute width & height
  container.style.top = '0';
  container.style.left = '0';
  // Get all required coordinates
  const clientPos = target.getBoundingClientRect();
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // If target position < tooltip required space, show tooltip below
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

const displayTooltipData = (container: HTMLElement, target: HTMLElement) => {
  const dataset = target.dataset;

  if ('tooltip' in dataset && dataset.tooltip) {
    container.innerText = dataset.tooltip;
  } else if ('tooltipResponsive' in dataset && dataset.tooltipResponsive) {
    container.innerText = dataset.tooltipResponsive;
  } else if ('tooltipId' in dataset && dataset.tooltipId) {
    const tooltipContent = document.getElementById(dataset.tooltipId);
    if (tooltipContent) {
      container.innerHTML = tooltipContent.innerHTML;
    } else {
      container.innerText = `Failed to fetch content of #${dataset.tooltipId}`;
    }
  } else if (target instanceof HTMLInputElement) {
    container.innerText = target.value;
  } else {
    container.innerText = target.innerText;
  }
};

export const TooltipContext = ({ children }: TooltipContextProps) => {
  const tooltipContainer = document.getElementById('tooltipContainer');
  if (!tooltipContainer) throw new Error('#tooltipContainer must exist in the DOM in order to show tooltips.');

  let popoverEntity: HTMLElement | null = null;

  const onMouseOver = (e: MouseEvent) => {
    const target = e.target;
    if (!isTargetElementShowingTooltip(target)) return;

    popoverEntity = target;
    displayTooltipData(tooltipContainer, target);
    tooltipContainer.showPopover();
    placeTooltip(tooltipContainer, target);
    tooltipContainer.classList.add('visible');
  };

  const clearTooltip = () => {
    tooltipContainer.innerText = '';
    tooltipContainer.classList.remove('visible');
    tooltipContainer.hidePopover();
    popoverEntity = null;
  };

  const onMouseOut = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement) || e.target !== popoverEntity) return;

    clearTooltip();
  };

  const onMouseDown = (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement) || e.target !== popoverEntity) return;
    if ('tooltipRemainOnClick' in popoverEntity.dataset) return;

    clearTooltip();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (popoverEntity && e.key === 'Escape') clearTooltip();
  };

  const onTooltipChangeText = (e: Event) => {
    if (!tooltipContainer || !(e instanceof CustomEvent) || typeof e.detail !== 'string') return;

    tooltipContainer.innerText = e.detail;
  };

  useEffect(() => {
    window.addEventListener('mouseover', onMouseOver, { capture: true, passive: true });
    window.addEventListener('mouseout', onMouseOut, { capture: true, passive: true });
    window.addEventListener('mousedown', onMouseDown, { capture: true, passive: true });
    window.addEventListener('keydown', onKeyDown, { capture: true, passive: true });
    window.addEventListener('tooltip:ChangeText', onTooltipChangeText);
    return () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('tooltip:ChangeText', onTooltipChangeText);
    };
  }, []);

  return <>{children}</>;
};
