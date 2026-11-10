---
summary: The instructions that control when the player saves their progress.
status: validated
last_reviewed: 2026-10-30
---

# Save

The Save category groups the instructions that control when the player saves their progress. They let users choose the right moments, whether to invite the player to save before an important battle or to prevent saving during a cutscene that must be played through.

## Manage save menu access

Manage save menu access lets users allow or deny the player access to the save menu.

### Parameters

| Parameter | Description |
| --- | --- |
| Access | The change made to the player's access: Allow, Deny, or Toggle (which reverses the current access) |

### Node

From top to bottom, the node's body holds:

1. Access

## Open save menu

Open save menu lets users invite the player to save by opening the save menu.

Open save menu has no parameters, and its node has no body.

## Ideas

- **Manage autosave** could let users control whether the game saves automatically.
- **Force autosave** could let users trigger an automatic save at a chosen moment.
- **Force save** could let users save the game without asking the player.
