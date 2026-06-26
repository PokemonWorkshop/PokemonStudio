# PixiJS renderer (Tier 3)

This folder is the GPU-batched replacement for `MapCanvas.tsx`'s Canvas2D
rendering. It exists alongside the Canvas2D renderer behind a feature flag
while the port lands; once it reaches parity the Canvas2D path will be
removed.

## Why

Canvas2D's `drawImage` per cell is the bottleneck for large maps and high
animated-cell counts. PixiJS uses WebGL with sprite-batching: a layer of
thousands of tiles draws in 1–2 GPU calls. Animation = swap `Sprite.texture`
(cheap). Pan/zoom = transform on the root `Container` (GPU-composited,
always smooth). Memory drops because we don't need map-sized per-layer
cache canvases anymore — sprites reference rects of the tileset BaseTexture
directly.

## Contract with the rest of the editor

`PixiMapCanvas` is a **drop-in replacement for `MapCanvas`**: same Props,
same forwarded `MapCanvasHandle`, same callbacks. Everything in
`MapEditorPage.tsx`, the palette, layer list, toolbar, undo/redo flow,
backend tasks, and the wasm bridge stays untouched. We just swap the
renderer module.

The bridge data flow is identical:
1. `readMapAndAssets` backend task fetches .tmx + .tsx + .png bytes
2. `TiledModule.openMapWithAssets` parses via libtiled
3. We get a `LoadedState` (same shape Canvas2D uses)
4. PixiMapCanvas builds textures + containers + sprites from it

## Port plan (by session)

- **Step 1 (this session):** scaffolding only — pixi.js in `package.json`,
  this README, an empty `PixiMapCanvas.tsx` stub.
- **Step 2:** read-only renderer. Load + display the map via PixiJS. No
  interactions, no editing. Validate textures + sprite batching work.
- **Step 3:** mouse + keyboard interactions. Pan/zoom via root container
  transform; brush preview + selection rect as `Graphics` overlays.
- **Step 4:** edit operations (stamp / erase / fill) drive the bridge AND
  the sprite scene-graph in sync. Undo/redo same code, redraw via sprite
  updates.
- **Step 5:** animation loop with `Sprite.texture` swaps (synced via the
  same global elapsed we use today).
- **Step 6:** feature flag in `MapEditorPage` to switch renderers, smoke
  test, then remove the Canvas2D path once we trust Pixi.

## Architecture notes for the next session

- **Texture per tileset:** decode each tileset PNG once into a
  `PIXI.BaseTexture` / `PIXI.Texture`. Per-tile textures are sliced lazily
  as `new PIXI.Texture(baseTexture, frame)` for each gid encountered.
  Cache in a `Map<gid, Texture>`.
- **One Container per visible tile layer:** `Container.zIndex` follows .tmx
  layer order. `Sprite` per non-empty cell. Hidden layers get their
  Container hidden, not destroyed (cheap toggle).
- **Bottom-left anchor:** set `Sprite.anchor.set(0, 1)` and position to
  `((x+1)*tileWidth, (y+1)*tileHeight)`. Matches our Canvas2D behavior.
- **Flip flags via Sprite scale/rotation** — same matrix as Canvas2D
  (D = rotate 90 + scale(1,-1), then H/V via sign flips).
- **Animations:** keep `globalElapsedRef` + an `animatedSprites` list.
  Per tick, for each animated cell compute current frame and assign
  `sprite.texture = framesTextures[frame]`. No layer cache to rebuild.
- **Pan/zoom:** apply to root `Container.scale.set(zoom)` and
  `Container.position.set(panX, panY)`. Replaces our CSS-transform scroll
  approach with native GPU compositing.
- **Selection rect / brush preview / grid:** `PIXI.Graphics` on a top
  container above the layers. Update on hover/drag.
- **Pixi v8 init is async:** `app.init({ canvas, width, height, ... })`.
  Handle the async in a useEffect with cancellation.
