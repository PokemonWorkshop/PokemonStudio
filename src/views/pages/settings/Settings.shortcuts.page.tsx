import { FieldCode } from '@components/database/dataBlocks/DataFieldsetField';
import { InputWithLeftLabelContainer, Label } from '@components/inputs';
import { PageEditor, PageTemplate } from '@components/pages';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface ShortcutGroup {
  categoryKey: string;
  shortcuts: { labelKey: string; mac: string; other: string }[];
}

const isMac = window.api.platform === 'darwin';

const formatKey = (key: string): string => {
  if (isMac) {
    if (key === 'Option') return '⌥ Opt';
    if (key === 'Cmd') return '⌘ Cmd';
    if (key === 'Ctrl') return '⌃ Ctrl';
    if (key === 'Shift') return '⇧ Shift';
  }
  return key;
};

const parseCombinations = (shortcutStr: string): string[][] => {
  return shortcutStr.split(' / ').map((combo) => combo.split(' + ').map((key) => key.trim()));
};

const SHORTCUTS_DATA: ShortcutGroup[] = [
  {
    categoryKey: 'shortcut_category_default',
    shortcuts: [
      { labelKey: 'shortcut_save_project', mac: 'Cmd + S', other: 'Ctrl + S' },
      { labelKey: 'shortcut_create_entry', mac: 'Cmd + N', other: 'Ctrl + N' },
      { labelKey: 'shortcut_copy_id', mac: 'Option + Shift + C', other: 'Ctrl + Shift + C' },
      { labelKey: 'shortcut_start_debug', mac: 'Cmd + P', other: 'Ctrl + P' },
    ],
  },
  {
    categoryKey: 'shortcut_category_navigation',
    shortcuts: [
      { labelKey: 'shortcut_navigate_list', mac: 'Option + \u2190 / Option + \u2192', other: 'Ctrl + \u2190 / Ctrl + \u2192' },
      {
        labelKey: 'shortcut_navigate_secondary_list',
        mac: 'Option + Shift + \u2190 / Option + Shift + \u2192',
        other: 'Ctrl + Alt + \u2190 / Ctrl + Alt + \u2192',
      },
    ],
  },
  {
    categoryKey: 'shortcut_category_miscellaneous',
    shortcuts: [
      { labelKey: 'shortcut_toggle_fullscreen', mac: 'Ctrl + Cmd + F', other: 'F11' },
      { labelKey: 'shortcut_minimize_window', mac: 'Cmd + H', other: 'Ctrl + H' },
      { labelKey: 'shortcut_open_devtools', mac: 'Cmd + Option + I', other: 'Ctrl + Alt + I' },
    ],
  },
];

const ShortcutRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
`;

const ShortcutStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`;

export const SettingsShortcutsPage = () => {
  const { t } = useTranslation();

  return (
    <PageTemplate title={t('keyboard_shortcuts')} size="default">
      {SHORTCUTS_DATA.map((group) => (
        <PageEditor key={group.categoryKey} editorTitle={t('keyboard_shortcuts')} title={t(group.categoryKey)}>
          {group.shortcuts.map((shortcut) => {
            const combinations = parseCombinations(isMac ? shortcut.mac : shortcut.other);
            return (
              <InputWithLeftLabelContainer key={shortcut.labelKey}>
                <Label>{t(shortcut.labelKey)}</Label>
                <ShortcutStack>
                  {combinations.map((keys, rowIdx) => (
                    <ShortcutRow key={rowIdx}>
                      {keys.map((key, keyIdx) => (
                        <FieldCode key={keyIdx}>{formatKey(key)}</FieldCode>
                      ))}
                    </ShortcutRow>
                  ))}
                </ShortcutStack>
              </InputWithLeftLabelContainer>
            );
          })}
        </PageEditor>
      ))}
    </PageTemplate>
  );
};
