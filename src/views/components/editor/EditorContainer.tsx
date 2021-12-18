import styled from 'styled-components';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: ${({ theme }) => theme.calc.height};
  width: 288px;
  box-sizing: border-box;
  left: 100%;
  max-height: ${({ theme }) => theme.calc.height};
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  padding-right: 16px;
  scrollbar-gutter: stable;
  background-color: ${({ theme }) => theme.colors.dark16};

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    margin: 4px 0;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.dark12};
    opacity: 0.8;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.text500};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => props.theme.colors.dark15};
    border: 1px solid ${(props) => props.theme.colors.text400};
  }
`;

export const EditorWithCollapseContainer = styled(EditorContainer)`
  width: 308px;
`;

export const SubEditorContainer = styled.div`
  margin: 0 -24px -24px -24px;
`;

export const EditorChildWithSubEditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;

  & ${EditorContainer} {
    position: relative;
    left: unset;
    width: 100%;
    height: unset;
  }
`;

type SubEditorSeparatorProps = { parentEditorHasScrollBar: boolean };

export const SubEditorSeparator = styled.div<SubEditorSeparatorProps>`
  margin-right: ${({ parentEditorHasScrollBar }) => (parentEditorHasScrollBar ? -8 : 0)}px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.dark12};
`;

export const SubEditorTopButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 34px;
`;
