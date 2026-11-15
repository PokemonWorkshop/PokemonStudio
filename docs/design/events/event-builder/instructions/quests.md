---
summary: The instructions that control the player's quests and their progress.
status: validated
last_reviewed: 2026-11-10
---

# Quests

The Quests category groups the instructions that control the player's quests and their progress.

## Start quest

Start quest lets users start quests, adding them to the player's ongoing quests.

### Parameters

| Parameter | Description |
| --- | --- |
| Quests to start | The quests that begin |

### Node

From top to bottom, the node's body holds:

1. Quests to start

## Complete quest

Complete quest lets users bring quests to a successful end: the player receives the quests' rewards and is told that the quests are complete.

### Parameters

| Parameter | Description |
| --- | --- |
| Quests to complete | The quests that end successfully |

### Node

From top to bottom, the node's body holds:

1. Quests to complete

## Fail quest

Fail quest lets users end quests in failure: the player does not receive their rewards.

### Parameters

| Parameter | Description |
| --- | --- |
| Quests to fail | The quests that end in failure |

### Node

From top to bottom, the node's body holds:

1. Quests to fail

## Ideas

- **Reveal hidden objective** could let users reveal a quest objective that the player could not see yet.
- **Complete quest objectives** could let users mark objectives of a quest as achieved.
- **Show quest progress** could let users tell the player how far a quest has progressed.
