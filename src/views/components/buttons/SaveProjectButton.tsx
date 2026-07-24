import styled from 'styled-components';
import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

import { BaseButtonStyle } from './GenericButtons';
import { useProjectSave } from '@hooks/useProjectSave';
import { useLoaderRef } from '@utils/loaderContext';
import { StudioShortcutActions, useShortcut } from '@hooks/useShortcuts';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { SaveEditorAndDeletionKeys, SaveEditorOverlay } from '@components/save/SaveEditorOverlay';
import {
  getMapEditorSaveTargets,
  getSaveShortcutOverride,
  setProjectSaveRunner,
  subscribeMapEditorSaveTargets,
} from '@hooks/saveShortcutOverride';
import { clearAllPendingEdits, getPendingEdits, subscribePendingEdits } from '@src/custom/MapEditor/pendingEdits';
import { ConfirmDeleteDialog } from '@src/custom/MapEditor/ConfirmDeleteDialog';

/**
 * Fork-owned split button. Clicking it still does "save all"; hovering opens a
 * breakdown so you can write just one thing — mirroring how PlayButton exposes
 * its release/debug/worldmap modes.
 *
 * "Save maps" and "Save events" act on the map open in the map editor (published
 * through the saveShortcutOverride registry), so they're disabled anywhere else.
 */

const SaveMenuContainer = styled.div`
  position: fixed;
  left: 60px;
  bottom: 16px;
  width: 256px;
  z-index: 100;
  cursor: default;

  & .save-menu {
    width: 240px;
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
    padding: 8px;
    background-color: ${({ theme: t }) => t.colors.dark20};
    border-radius: 8px;

    & span.entry {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 16px 8px 16px;
      border-radius: 8px;
      ${({ theme: t }) => t.fonts.normalRegular};
      color: ${({ theme: t }) => t.colors.text400};
      user-select: none;
      cursor: pointer;

      &:hover {
        background-color: ${({ theme: t }) => t.colors.dark22};
      }

      &[data-disabled='true'] {
        color: ${({ theme: t }) => t.colors.text600};
        cursor: default;

        &:hover {
          background-color: transparent;
        }
      }
    }

    & hr {
      border: none;
      border-top: 1px solid ${({ theme: t }) => t.colors.dark22};
      margin: 4px 8px;
      width: calc(100% - 16px);
    }
  }
`;

/** Marks a menu entry that currently has something unsaved. */
const PendingDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 100%;
  flex: none;
  background-color: ${({ theme: t }) => t.colors.dangerBase};
`;

const SaveProjectButtonContainer = styled(BaseButtonStyle)`
  display: inline-block;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  padding: 14px 6px 6px 14px;

  &[data-disabled] {
    background-color: ${theme.colors.dark16};
  }

  &:hover {
    background-color: ${theme.colors.dark18};
  }

  &:active > ${SvgContainer} {
    background-color: ${theme.colors.primarySoft};

    svg {
      color: ${theme.colors.primaryBase};
    }
  }
`;

const SplitContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  & span.triangle {
    position: absolute;
    display: inline-block;
    bottom: 6px;
    right: 4px;
    height: 0;
    width: 0;
    border-bottom: 4px solid ${({ theme: t }) => t.colors.text600};
    border-left: 4px solid transparent;
    pointer-events: none;
  }

  &.open ${SaveMenuContainer} {
    visibility: visible;
    transition: visibility 0s ease-in 300ms;
  }

  ${SaveMenuContainer} {
    visibility: hidden;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

type BadgeProps = {
  visible: boolean;
};

const Badge = styled.div<BadgeProps>`
  ${({ visible }) => !visible && 'display: none;'}
  border-radius: 100%;
  background-color: ${theme.colors.dangerBase};
  width: 8px;
  height: 8px;
`;

export const SaveProjectButton = () => {
  const { isDataToSave, isMapsToSave, save } = useProjectSave();
  const loaderRef = useLoaderRef();
  const dialogsRef = useDialogsRef<SaveEditorAndDeletionKeys>();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // The map editor publishes its save handles while it's mounted.
  const mapTargets = useSyncExternalStore(subscribeMapEditorSaveTargets, getMapEditorSaveTargets);
  // Map edits held in memory. They survive navigating between maps, but not
  // quitting — so closing with any pending is the one moment work is lost.
  const pendingEdits = useSyncExternalStore(subscribePendingEdits, getPendingEdits);
  const [closeGuard, setCloseGuard] = useState(false);

  // Let the map editor's save dialog reach the project pipeline: writing map
  // files alone does not make the change take effect.
  React.useEffect(() => {
    setProjectSaveRunner(() => void handleSave());
    return () => setProjectSaveRunner(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapsToSave, isDataToSave]);

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (getPendingEdits().length === 0) return;
      // Electron cancels the close when returnValue is set; it shows no
      // native prompt, so we raise our own instead.
      e.preventDefault();
      e.returnValue = '';
      setCloseGuard(true);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const handleSave = async () => {
    const skipMapWarning = localStorage.getItem('neverRemindMeMapModification') === 'true';
    if (skipMapWarning || !isMapsToSave) {
      save(
        () => loaderRef.current.close(),
        ({ errorMessage }) => loaderRef.current.setError('saving_project_error', errorMessage)
      );
      return;
    }
    dialogsRef.current?.openDialog('map_warning', true);
  };

  /**
   * Save all: write the map/event files, then ALWAYS run the project pipeline.
   *
   * The pipeline is what reproduces the sequence that actually makes a map take
   * effect — the same thing you get by pressing Ctrl+S (which writes the .tmx)
   * and then hitting Save all. Gating it on `isDataToSave` broke exactly that:
   * with no other project data dirty the pipeline was skipped, so saveMapInfo /
   * saveRMXPMapInfo never ran and the map warning never appeared.
   */
  const handleSaveAll = async () => {
    setIsOpen(false);
    // AWAIT the file writes before running the pipeline. Firing them off and
    // immediately saving the project meant the pipeline ran against the state
    // from before the map was written — which is why a single Save all did not
    // take effect and a second one did.
    //
    // Events first, then maps: writing events rewrites Data/Map###.rxdata, so
    // saving the .tmx last keeps the source newest.
    // Anything unsaved in the map editor gets confirmed first: the same dialog
    // the menu entries use, so "what am I about to write" is always an explicit
    // choice rather than a silent side effect of Save all. The dialog carries
    // on into the project pipeline itself once the files are written.
    if (mapTargets?.mapDirty || mapTargets?.eventsDirty) {
      mapTargets.openSaveDialog(true);
      return;
    }
    await handleSave();
  };

  const runMenuAction = (enabled: boolean, action?: () => void) => {
    if (!enabled || !action) return;
    setIsOpen(false);
    action();
  };

  const anythingToSave = isDataToSave || !!mapTargets?.mapDirty || !!mapTargets?.eventsDirty;
  const outsideMapEditor = mapTargets ? undefined : t('save_map_editor_only');

  const shortcutMap = useMemo<StudioShortcutActions>(() => {
    // No shortcut if an editor is opened and no data to save
    const isShortcutEnabled = () => !document.querySelector('#dialogs')?.textContent && isDataToSave;
    return {
      save: () => {
        // Fork-specific: the map editor route claims Ctrl+S while mounted so
        // it can save just the map (not the whole project). When claimed,
        // skip the project-save path entirely — even the dialog warning —
        // and run the override.
        const override = getSaveShortcutOverride();
        if (override) {
          override();
          return;
        }
        if (isShortcutEnabled()) handleSave();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, isDataToSave]);
  useShortcut(shortcutMap);

  return (
    <>
      <SplitContainer className={isOpen ? 'open' : undefined} onMouseLeave={() => setIsOpen(false)}>
        <SaveProjectButtonContainer onMouseEnter={() => setIsOpen(true)} onClick={() => void handleSaveAll()} disabled={!anythingToSave}>
          <BaseIcon color={theme.colors.navigationIconColor} size="s" icon="save" disabled={!anythingToSave} />
          <BadgeContainer>
            <Badge visible={anythingToSave} />
          </BadgeContainer>
          <span className="triangle" />
        </SaveProjectButtonContainer>
        <SaveMenuContainer>
          <div className="save-menu">
            <span className="entry" data-disabled={!anythingToSave} onClick={() => void handleSaveAll()}>
              {t('save_all')}
              {anythingToSave && <PendingDot />}
            </span>
            <hr />
            <span className="entry" data-disabled={!isDataToSave} onClick={() => runMenuAction(isDataToSave, () => void handleSave())}>
              {t('save_data')}
              {isDataToSave && <PendingDot />}
            </span>
            <span
              className="entry"
              data-disabled={!mapTargets?.mapDirty}
              title={outsideMapEditor}
              onClick={() => runMenuAction(!!mapTargets?.mapDirty, () => mapTargets?.openSaveDialog(false))}
            >
              {t('save_maps')}
              {mapTargets?.mapDirty && <PendingDot />}
            </span>
            <span
              className="entry"
              data-disabled={!mapTargets?.eventsDirty}
              title={outsideMapEditor}
              onClick={() => runMenuAction(!!mapTargets?.eventsDirty, () => mapTargets?.openSaveDialog(false))}
            >
              {t('save_events')}
              {mapTargets?.eventsDirty && <PendingDot />}
            </span>
          </div>
        </SaveMenuContainer>
      </SplitContainer>
      <SaveEditorOverlay ref={dialogsRef} />
      {closeGuard && (
        <ConfirmDeleteDialog
          title={t('unsaved_maps_title')}
          message={
            <>
              {t('unsaved_maps_message')}
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {pendingEdits.map((edit) => (
                  <li key={edit.dbSymbol}>
                    {edit.mapName}
                    {edit.tiles && edit.events ? ` — ${t('unsaved_maps_both')}` : edit.events ? ` — ${t('unsaved_maps_events')}` : ` — ${t('unsaved_maps_tiles')}`}
                  </li>
                ))}
              </ul>
            </>
          }
          confirmLabel={t('unsaved_maps_discard')}
          skipLabel=""
          skip={false}
          onSkipChange={() => undefined}
          onConfirm={() => {
            // Explicitly discarding — drop the parked work and let the close through.
            clearAllPendingEdits();
            setCloseGuard(false);
            window.close();
          }}
          onCancel={() => setCloseGuard(false)}
        />
      )}
    </>
  );
};
