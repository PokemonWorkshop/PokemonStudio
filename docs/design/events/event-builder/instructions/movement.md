---
summary: The instructions that control the movement and position of the player and events.
status: validated
last_reviewed: 2026-10-31
---

# Movement

The Movement category groups the instructions that control the movement and position of the player and events. They bring maps to life, whether to make a character walk up to the player, move an obstacle out of the way, or take the player to another place.

## Change Event Properties

> 🚧 **This instruction is still being explored.**

Change Event Properties lets users change some [properties](../../properties.md) of an event or of the player while the game runs, such as speed or opacity.

## Move event

> 🚧 **This instruction is still being explored.**

Move event lets users give the player or an event a series of moves to follow, in order.

## Teleport event

> 🚧 **This instruction is still being explored.**

Teleport event lets users place an event at another position on the current map, or swap its position with another event.

## Teleport player

> 🚧 **This instruction is still being explored.**

Teleport player lets users send the player to a position on the current map or on another map.

## Wait for move completion

Wait for move completion lets users pause a [sequence](../visual-scripting.md) until the player and events finish moving.

### Parameters

| Parameter | Description |
| --- | --- |
| Wait for | Whether the sequence waits for All events or for Specific events |
| Events to wait for | The player and events to wait for, when Wait for is set to Specific events |
| Maximum waiting time | The time, in seconds, after which the sequence continues even if some moves are still in progress |

### Node

From top to bottom, the node's body holds:

1. Wait for
2. Events to wait for, when Wait for is set to Specific events

## Ideas

- **Manage pathfinding** could let users make an event reach a destination on its own, finding a path around obstacles.
- **Manage follower** could let users make an event follow the player wherever they go.
- **Turn player toward event** could let users make the player face an event.
