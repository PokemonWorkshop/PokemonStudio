# tiled_bridge wasm

`tiled_bridge.js` + `tiled_bridge.wasm` are the libtiled-in-WebAssembly bridge
that powers the in-Studio map editor. They are built **out-of-tree** from
upstream Tiled and dropped here as artifacts. The build pipeline lives at
`~/Desktop/tiled-wasm/`.

## To rebuild after pulling new upstream Tiled

```sh
cd ~/Desktop/tiled-wasm
source setup-env.sh
cd build && ninja tiled_bridge
cp tiled_bridge.{js,wasm} \
   "~/Desktop/PokemonStudio - Forked/src/custom/MapEditor/wasm/"
```

The Emscripten + Qt-Wasm toolchain version is pinned (Qt 6.8.3,
emsdk 3.1.56) in `setup-env.sh`. Upgrade those together or builds break.

## Why the JS shim is loaded via a `<script>` tag instead of `import`

Emscripten built it as `MODULARIZE=1 EXPORT_ES6=0` — a UMD-style file that
Vite cannot parse as ESM. `tiledWasm.ts` injects it as a `<script>` and
calls the global factory `window.tiled_bridge_entry`.

## Bundle size

~14.7 MB. Loaded once per Studio session; cached for the rest. If this
becomes painful, switch to git-lfs or pull the artifact from a release at
install time.

## `sample.tmx`

Bundled for offline smoke tests. Safe to delete once the editor is
production-ready and we trust the load path.
