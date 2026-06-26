/**
 * Shim — re-exports the fork's customized MapNewEditor from
 * `src/custom/MapEditor/`. The real implementation lives there so
 * upstream changes to this file path won't auto-merge into our
 * customizations (the layer skeleton, mandatory tilesets logic,
 * combobox tileset picker, etc.). Same pattern as
 * `src/views/pages/world/Overview.page.tsx`.
 *
 * If upstream materially changes the MapNewEditor contract (different
 * Props, new mandatory hook), reconcile by editing the fork copy in
 * `src/custom/MapEditor/MapNewEditor.tsx` — not this file.
 */
export { MapNewEditor } from '@src/custom/MapEditor/MapNewEditor';
