import React, { useState, MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const ToolTipContainer = styled.div`
  visibility: hidden;
  position: absolute;
  z-index: 100000;
`;

const ToolTipElement = styled.div`
  position: relative;
  padding: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.dark8};
  color: ${({ theme }) => theme.colors.text100};
`;

type ToolTipStyles = {
  anchor: {
    // Should always be expressed in px
    left?: number;
    top?: number;
    transform?: 'translateY(-100%)' | 'translateX(-100%)';
    visibility?: 'visible';
  };
  element: {
    // Should always be expressed in %
    left?: string | number;
    transform?: 'translateY(-50%)' | 'translateY(-100%)';
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
  };
};

const TOOL_TIP_ELEMENT_SPACING = '4px';

type ToolTipPosition =
  | 'top-begin'
  | 'top-center'
  | 'top-end'
  | 'bottom-begin'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-begin'
  | 'left-center'
  | 'left-end'
  | 'right-begin'
  | 'right-center'
  | 'right-end';

const computeToolTipStyles = <U extends HTMLElement>(position: ToolTipPosition, e: MouseEvent<U>): ToolTipStyles => {
  const element = e.currentTarget;
  // Get screen accurate coordinate of currentTarget
  const rect = e.currentTarget.getBoundingClientRect();
  const titleBarHeight = document.querySelector('.cet-titlebar')?.clientHeight || 0;
  // Precompute all required variables
  const top = Math.floor(rect.top) - titleBarHeight;
  const left = Math.floor(rect.left);
  const bottom = top + element.offsetHeight;
  const right = left + element.offsetWidth;
  const middleX = Math.floor(left + element.offsetWidth / 2);
  const middleY = Math.floor(top + element.offsetHeight / 2);

  switch (position) {
    case 'bottom-begin':
      return {
        anchor: { top: bottom, left: left, visibility: 'visible' },
        element: { marginTop: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'bottom-center':
      return {
        anchor: { top: bottom, left: middleX, visibility: 'visible' },
        element: { left: '-50%', marginTop: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'bottom-end':
      return {
        anchor: { top: bottom, left: right, visibility: 'visible' },
        element: { left: '-100%', marginTop: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'left-begin':
      return {
        anchor: { top: top, left: left, transform: 'translateX(-100%)', visibility: 'visible' },
        element: { marginRight: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'left-center':
      return {
        anchor: { top: middleY, left: left, transform: 'translateX(-100%)', visibility: 'visible' },
        element: { transform: 'translateY(-50%)', marginRight: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'left-end':
      return {
        anchor: { top: bottom, left: left, transform: 'translateX(-100%)', visibility: 'visible' },
        element: { transform: 'translateY(-100%)', marginRight: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'right-begin':
      return {
        anchor: { top: top, left: right, visibility: 'visible' },
        element: { marginLeft: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'right-center':
      return {
        anchor: { top: middleY, left: right, visibility: 'visible' },
        element: { transform: 'translateY(-50%)', marginLeft: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'right-end':
      return {
        anchor: { top: bottom, left: right, visibility: 'visible' },
        element: { transform: 'translateY(-100%)', marginLeft: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'top-begin':
      return {
        anchor: { top: top, left: left, transform: 'translateY(-100%)', visibility: 'visible' },
        element: { marginBottom: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'top-center':
      return {
        anchor: { top: top, left: middleX, transform: 'translateY(-100%)', visibility: 'visible' },
        element: { left: '-50%', marginBottom: TOOL_TIP_ELEMENT_SPACING },
      };
    case 'top-end':
      return {
        anchor: { top: top, left: right, transform: 'translateY(-100%)', visibility: 'visible' },
        element: { left: '-100%', marginBottom: TOOL_TIP_ELEMENT_SPACING },
      };
    default:
      return ((v: never) => v)(position);
  }
};

/**
 * Hook helping to show tooltip properly
 * @example
 * const { buildOnMouseEnter, onMouseLeave, renderToolTip } = useToolTip();
 *
 * return (
 *  <SomeComplexPage>
 *    <SomeElementRequiringToolTip onMouseLeave={onMouseLeave} onMouseEnter={buildOnMouseEnter('helpText', 'top-center')} />
 *    {renderToolTip()}
 *  </SomeComplexPage>
 * )
 */
export const useToolTip = <U extends HTMLElement>() => {
  const [toolTipText, setToolTipText] = useState('');
  const [toolTipStyles, setToolTipStyles] = useState<ToolTipStyles>({ anchor: {}, element: {} });

  return {
    buildOnMouseEnter: (text: string, position: ToolTipPosition) => (e: MouseEvent<U>) => {
      setToolTipText(text);
      setToolTipStyles(computeToolTipStyles(position, e));
    },
    onMouseLeave: () => {
      setToolTipStyles((current) => ({ ...current, anchor: { ...current.anchor, visibility: undefined } }));
    },
    renderToolTip: () =>
      ReactDOM.createPortal(
        <ToolTipContainer style={toolTipStyles.anchor}>
          <ToolTipElement style={toolTipStyles.element}>{toolTipText}</ToolTipElement>
        </ToolTipContainer>,
        document.querySelector('#tooltip') || document.createElement('div')
      ),
  };
};
