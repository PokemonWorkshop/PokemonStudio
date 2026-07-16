import styled, { css } from 'styled-components';

/**
 * Shared styled-components for the RMXP-style event editor dialog. Kept in one
 * place so the dialog shell and its extracted sub-panels (CommandForm, blocks,
 * fields, ScriptEditor) all draw from the same visual vocabulary.
 */

// --- window chrome -------------------------------------------------------------

export const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Dialog = styled.div`
  width: 920px;
  height: min(810px, calc(100vh - 48px));
  min-width: 640px;
  min-height: 440px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  /* Drag the bottom-right corner to resize the window. */
  resize: both;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  border-radius: 10px;
  overflow: hidden;
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};

  /* Studio-themed scrollbars everywhere inside the dialog — the default OS
     bars read as jarringly bright against the dark chrome. */
  & *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  & *::-webkit-scrollbar-track {
    background: transparent;
  }
  & *::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.dark24};
    border: 2px solid ${({ theme }) => theme.colors.dark16};
    border-radius: 6px;
  }
  & *::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.dark20};
  }
  & *::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* A full-width control must include its own padding + border in that width,
     or it overflows its container and spawns a pointless horizontal scrollbar. */
  & input,
  & textarea,
  & select {
    box-sizing: border-box;
  }
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
  ${({ theme }) => theme.fonts.normalMedium};
`;

export const IconBtn = styled.button`
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: transparent;
  color: ${({ theme }) => theme.colors.text100};
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.dark20}; }
  &:disabled { opacity: 0.35; cursor: default; }
`;

// --- header + page tabs --------------------------------------------------------

export const Header = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 10px 14px 8px;
`;

export const FieldCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FieldLabel = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

export const NameInput = styled.input`
  width: 170px;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark12};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalMedium};
`;

export const PageOps = styled.div`
  margin-left: auto;
  display: flex;
  gap: 6px;
`;

export const PasteWrap = styled.div`
  position: relative;
  display: flex;
`;

export const PasteMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  min-width: 150px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark16};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`;

export const PasteMenuItem = styled.button`
  padding: 6px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: ${({ theme }) => theme.colors.dark20}; }
`;

export const OpBtn = styled.button<{ $danger?: boolean }>`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: transparent;
  color: ${({ theme, $danger }) => ($danger ? theme.colors.dangerBase : theme.colors.text100)};
  ${({ theme }) => theme.fonts.normalSmall};
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: ${({ theme }) => theme.colors.dark20}; }
  &:disabled { opacity: 0.4; cursor: default; }
`;

export const CaretBtn = styled(OpBtn)`
  padding: 6px 6px;
  margin-left: -4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;

export const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark20};
`;

export const Tab = styled.button<{ $active: boolean }>`
  padding: 5px 16px;
  border-radius: 6px 6px 0 0;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.dark24 : 'transparent')};
  border-bottom: none;
  background: ${({ theme, $active }) => ($active ? theme.colors.dark12 : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  ${({ theme }) => theme.fonts.normalSmall};
  cursor: pointer;
`;

// --- body layout ---------------------------------------------------------------

/**
 * Marks the dialog body — the element whose `overflow: hidden` clips the
 * absolutely-positioned dropdown lists inside the panels. Fields measure
 * against it to decide whether a dropdown should open up or down.
 */
export const DIALOG_BODY_ATTR = 'data-evdialog-body';

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

export const LeftColumn = styled.div`
  width: 356px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.colors.dark20};
`;

export const SideBySide = styled.div`
  display: flex;
  gap: 10px;
  align-items: stretch;
`;

export const RightColumn = styled.div`
  flex: 1;
  min-width: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Block = styled.div<{ $grow?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  padding: 10px;
  ${({ $grow }) => ($grow ? 'flex: 1; min-width: 0;' : '')}
`;

export const BlockTitle = styled.p`
  margin: 0 0 8px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
  min-width: 0;
  ${({ theme }) => theme.fonts.normalSmall};
  &:last-child { margin-bottom: 0; }
`;

export const Dim = styled.span<{ $off?: boolean }>`
  color: ${({ theme, $off }) => ($off ? theme.colors.text500 : theme.colors.text400)};
  white-space: nowrap;
`;

// --- small form controls -------------------------------------------------------

export const SmallInput = styled.input`
  width: 64px;
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  &:disabled { opacity: 0.45; }
`;

export const SmallSelect = styled.select`
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  max-width: 100%;
  min-width: 0;
  text-overflow: ellipsis;
  &:disabled { opacity: 0.45; }
`;

export const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.normalSmall};
  cursor: pointer;
  white-space: nowrap;
`;

// --- command list --------------------------------------------------------------

export const CommandList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.55;
  padding: 4px 0;
`;

export const CommandRow = styled.div<{ $blank?: boolean; $selected?: boolean; $script?: boolean }>`
  padding: 2px 12px;
  white-space: pre-wrap;
  cursor: pointer;
  color: ${({ theme, $blank }) => ($blank ? theme.colors.text500 : theme.colors.text100)};
  background: ${({ theme, $selected, $script }) =>
    $selected ? `${theme.colors.primarySoft}44` : $script ? theme.colors.dark14 : 'transparent'};
  border-left: 2px solid ${({ theme, $selected, $script }) => ($selected ? theme.colors.primaryBase : $script ? theme.colors.dark24 : 'transparent')};
  &:hover { background: ${({ theme, $selected }) => ($selected ? `${theme.colors.primarySoft}44` : theme.colors.dark18)}; }
`;

export const CmdLabel = styled.span`
  color: ${({ theme }) => theme.colors.primaryBase};
  font-weight: 600;
`;

export const CmdBody = styled.span`
  color: ${({ theme }) => theme.colors.text100};
`;

export const CmdCont = styled.span`
  color: ${({ theme }) => theme.colors.text400};
`;

export const CmdComment = styled.span`
  color: #7fa25a;
  font-style: italic;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
`;

export const CmdToolbar = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const FormArea = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// --- command picker ("Add command" panel) --------------------------------------

export const PickerPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.dark12};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
`;

export const CmdGroupTitle = styled.p`
  margin: 2px 0 0;
  ${({ theme }) => theme.fonts.normalSmall};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text500};
`;

export const CmdGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
`;

export const CmdItem = styled.button`
  text-align: left;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  background: ${({ theme }) => theme.colors.dark14};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.dark20};
    border-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

export const CmdItemName = styled.span`
  display: block;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
`;

export const CmdItemHint = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.text500};
`;

export const FormTextArea = styled.textarea`
  min-height: 64px;
  resize: vertical;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  color: ${({ theme }) => theme.colors.text100};
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
`;

// --- script editor (highlight overlay) -----------------------------------------

// Shared typography so the highlight <pre> and the transparent <textarea>
// overlay each other glyph-for-glyph.
export const scriptSharedCss = css`
  margin: 0;
  padding: 6px 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 2;
  border: 0;
`;

export const ScriptEditorWrap = styled.div`
  position: relative;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background: ${({ theme }) => theme.colors.dark14};
  overflow: hidden;
`;

export const ScriptHighlight = styled.pre`
  ${scriptSharedCss};
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.text100};
`;

export const ScriptTextArea = styled.textarea`
  ${scriptSharedCss};
  position: relative;
  display: block;
  width: 100%;
  min-height: 72px;
  resize: vertical;
  overflow: auto;
  background: transparent;
  color: transparent;
  caret-color: ${({ theme }) => theme.colors.text100};
  outline: none;
`;

// --- footer --------------------------------------------------------------------

export const Footer = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark20};
`;

export const FooterBtn = styled.button<{ $primary?: boolean }>`
  padding: 6px 22px;
  border-radius: 6px;
  border: 1px solid ${({ theme, $primary }) => ($primary ? theme.colors.primaryBase : theme.colors.dark24)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.primaryBase : 'transparent')};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalMedium};
  cursor: pointer;
  &:hover { filter: brightness(1.1); }
  &:disabled { opacity: 0.4; cursor: default; filter: none; }
`;

// --- graphic picker ------------------------------------------------------------

export const GraphicPreview = styled.div`
  width: 92px;
  height: 104px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.dark24};
  background-color: ${({ theme }) => theme.colors.dark14};
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  overflow: hidden;
`;

export const PickerGrid = styled.div`
  max-height: 180px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 8px;
`;

export const PickerCell = styled.button<{ $active: boolean }>`
  height: 72px;
  border-radius: 6px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primaryBase : theme.colors.dark24)};
  background-color: ${({ theme }) => theme.colors.dark14};
  cursor: pointer;
  overflow: hidden;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text400};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 3px;
`;
