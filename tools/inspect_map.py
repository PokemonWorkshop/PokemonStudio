"""Inspect what a PSDK project has on disk for one map, end to end.

Reads the authored .tmx, the converted Data/Map###.rxdata, and the tileset
passage table PSDK generated, then reports whether they agree. This exists so a
map change can be verified without launching the game and eyeballing it — the
whole pipeline is inspectable from files.

    python tools/inspect_map.py "<project path>" <tiled name> <map id>
    python tools/inspect_map.py "C:/.../Forked Studio Project" tester 22

Reported per stage:
  tmx      metadata layers (passages / systemtags / terrain_tag), nonzero cells
  rxdata   the 3 RMXP tile layers, and the tile id sitting at each marked cell
  tileset  the passage flag for those tile ids (15 = 0b1111 = blocked all ways)

PSDK encodes per-cell metadata by giving such a cell its OWN tile id in an
expanded tileset (well past RMXP's 384), so a marked cell should have a tile id
distinct from its neighbours AND a nonzero passage flag.
"""

import io
import os
import re
import struct
import sys
from datetime import datetime

META_LAYERS = re.compile(r'passage|systemtag|terrain', re.I)
LAYER_RE = re.compile(
    r'<layer\b[^>]*name="([^"]*)"[^>]*>[\s\S]*?<data\b[^>]*encoding="csv"[^>]*>([\s\S]*?)</data>'
)


def mtime(path):
    if not os.path.exists(path):
        return 'missing'
    return datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d %H:%M:%S')


def tmx_layers(path):
    """{layer name: [gid per cell]} for every csv tile layer, in document order."""
    text = io.open(path, encoding='utf-8').read()
    out = {}
    for match in LAYER_RE.finditer(text):
        name, csv = match.group(1), match.group(2)
        out[name] = [int(v) for v in csv.replace('\n', '').split(',') if v.strip()]
    return out


def tables(data, want_dim=None):
    """Every RMXP Table blob in a marshalled file, found by its binary header.

    Scanning for the header rather than parsing Marshal because Ruby dedupes the
    "Table" symbol — only the first occurrence carries the name, the rest are
    symlinks, so a naive name search finds exactly one table.
    """
    found = []
    for pos in range(len(data) - 20):
        dim, xs, ys, zs, total = struct.unpack_from('<5i', data, pos)
        if dim not in (1, 2, 3):
            continue
        if want_dim and dim != want_dim:
            continue
        if not (0 < xs <= 4096 and 0 <= ys <= 4096 and 0 <= zs <= 64):
            continue
        if total != xs * max(ys, 1) * max(zs, 1) or not (0 < total <= 200000):
            continue
        if pos + 20 + total * 2 > len(data):
            continue
        found.append((pos, dim, xs, ys, zs, struct.unpack_from('<%dh' % total, data, pos + 20)))
    return found


def read_tileset_id(data):
    """The map's @tileset_id ivar, read straight out of the Marshal stream."""
    i = data.find(b'tileset_id')
    if i < 0:
        return None
    p = i + len('tileset_id')
    if data[p] != 0x69:  # 'i' = Integer
        return None
    c = data[p + 1]
    c = c - 256 if c > 127 else c
    if c == 0:
        return 0
    if 0 < c <= 4:
        return int.from_bytes(data[p + 2:p + 2 + c], 'little')
    return c - 5 if c > 0 else c + 5


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        return 1
    project, tiled_name, map_id = sys.argv[1], sys.argv[2], int(sys.argv[3])

    tmx_path = os.path.join(project, 'Data', 'Tiled', 'Maps', f'{tiled_name}.tmx')
    rxdata_path = os.path.join(project, 'Data', f'Map{map_id:03d}.rxdata')
    tilesets_path = os.path.join(project, 'Data', 'Tilesets.rxdata')

    print(f'tmx      {mtime(tmx_path)}  {tmx_path}')
    print(f'rxdata   {mtime(rxdata_path)}  Map{map_id:03d}.rxdata')
    print(f'tilesets {mtime(tilesets_path)}')
    if mtime(rxdata_path) != 'missing' and mtime(tmx_path) > mtime(rxdata_path):
        print('  NOTE: .tmx is newer than .rxdata — the game has not converted this edit yet.')
    print()

    # --- stage 1: what the editor authored -------------------------------
    layers = tmx_layers(tmx_path)
    marked = []
    print('tmx metadata layers:')
    for name, cells in layers.items():
        if not META_LAYERS.search(name):
            continue
        nz = [(i, v) for i, v in enumerate(cells) if v]
        print(f'  {name:20} nonzero={len(nz):4} {nz[:12]}')
        if name.lower() == 'passages':
            marked = [i for i, _ in nz]
    print()

    # --- stage 2: what PSDK converted ------------------------------------
    if not os.path.exists(rxdata_path):
        print('no rxdata yet — launch the game once to convert.')
        return 0
    map_tables = tables(io.open(rxdata_path, 'rb').read(), want_dim=3)
    if not map_tables:
        print('rxdata: no 3-D tile table found.')
        return 0
    _, _, xs, ys, zs, vals = map_tables[0]
    print(f'rxdata tile table {xs}x{ys}x{zs}')
    plane = xs * ys
    ids_at_marked = {}
    for z in range(zs):
        layer = vals[z * plane:(z + 1) * plane]
        print(f'  z={z} nonzero={sum(1 for v in layer if v)}')
    z0 = vals[0:plane]
    for idx in marked:
        neighbours = [z0[idx - 1] if idx else None, z0[idx], z0[idx + 1] if idx + 1 < plane else None]
        ids_at_marked[idx] = z0[idx]
        distinct = z0[idx] not in (neighbours[0], neighbours[2])
        print(f'    marked cell {idx:4} -> tile id {z0[idx]:4} neighbours {neighbours} '
              f'{"OK distinct" if distinct else "SAME as neighbour (metadata not encoded)"}')
    print()

    # --- stage 3: does the tileset actually flag them impassable? ---------
    if not os.path.exists(tilesets_path) or not ids_at_marked:
        return 0
    wanted = sorted(set(ids_at_marked.values()))
    biggest = max(wanted)
    tileset_id = read_tileset_id(io.open(rxdata_path, 'rb').read())
    all_tables = [t for t in tables(io.open(tilesets_path, 'rb').read(), want_dim=1) if t[2] > 1]
    # Tilesets.rxdata is an array whose [0] is nil, and each tileset contributes
    # three 1-D tables in order: passages, priorities, terrain_tags. So the Nth
    # tileset's passages table is at (N-1)*3 — that's the only one worth reading,
    # printing every tileset's flags buries the answer in noise.
    print(f'tileset_id {tileset_id} (15 = blocked all four directions):')
    slot = (tileset_id - 1) * 3
    if tileset_id and 0 <= slot < len(all_tables):
        pos, _, size, _, _, vals1 = all_tables[slot]
        if size > biggest:
            flags = {tid: vals1[tid] for tid in wanted}
            ok = all(v for v in flags.values())
            print(f'  passages table @{pos} size={size}: {flags}  {"OK all blocked" if ok else "SOME NOT BLOCKED"}')
        else:
            print(f'  passages table too small ({size} <= {biggest}) — tileset/map mismatch?')
    else:
        print(f'  could not locate tileset {tileset_id} among {len(all_tables)} tables')
    return 0


if __name__ == '__main__':
    sys.exit(main())
