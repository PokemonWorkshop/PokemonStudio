import styled from 'styled-components';

export type ToolTipProps = {
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
};

/**
 * **ToolTip component**. This component is visually hidden by default.
 *
 * It needs to be used with its **ToolTipContainer** so when mouse move over the container, tooltip is visible.
 *
 * @example // Add a tooltip on top with 32px to the left of spaccing
 * <ToolTipContainer>
 *   <SomeContent />
 *   <ToolTip top="0" left="32px">Some tooltip</ToolTip>
 * </ToolTipContainer>
 * @example // Add a tooltip on top of a component
 * <ToolTipContainer>
 *   <SomeContent />
 *   <ToolTip bottom="100%">Some tooltip</ToolTip>
 * </ToolTipContainer>
 * @example // Add a tooltip below a component
 * <ToolTipContainer>
 *   <SomeContent />
 *   <ToolTip top="100%">Some tooltip</ToolTip>
 * </ToolTipContainer>
 * @note it can happen that `ToolTipContainer` breaks grid formating, the easiest way to handle that is composing a component that defines grid formating using ToolTipContainer as parent.
 * ```
 *   const ToolTipContainerWithGridSpanning = styled(ToolTipContainer)`grid-column: 1 / -1;`
 * ```
 */
export const ToolTip = styled.div.attrs(() => ({ className: 'tooltip' }))<ToolTipProps>`
  visibility: hidden;
  position: absolute;
  z-index: 1;
  padding: 8px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.dark8};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalRegular}
  ${({ top }) => top !== undefined && `top: ${top};`}
  ${({ right }) => right !== undefined && `right: ${right};`}
  ${({ left }) => left !== undefined && `left: ${left};`}
  ${({ bottom }) => bottom !== undefined && `bottom: ${bottom};`}
  user-select: none;

  :hover {
    visibility: hidden;
  }
`;

export const ToolTipContainer = styled.div`
  position: relative;
  margin: 0;
  padding: 0;
  &:hover > ${ToolTip} {
    visibility: visible;
  }
`;

export const ToolTipContainerForButton = styled(ToolTipContainer)`
  width: max-content;
`;

export const ToolTipForResponsive = styled(ToolTip)`
  display: none;
  width: max-content;

  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: inline-block;
  }
`;

export const ToolTipMainMenu = styled(ToolTip)`
  width: max-content;

  ::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 100%; /* To the left of the tooltip */
    margin-top: -4px;
    border-width: 4px;
    border-style: solid;
    border-color: transparent ${({ theme }) => theme.colors.dark8} transparent transparent;
  }
`;
