---
summary: How events relate to maps, and what an event is made of.
status: validated
last_reviewed: 2026-10-30
---

# Event architecture

An event combines two parts:

- its [Event Properties](properties.md), which define what the event is: how it looks, moves, and collides;
- its [instructions](event-builder/instructions/README.md), which define what it does.

Both are edited in the [Event Builder](event-builder/README.md).

## Scope

Each event belongs to one map and sits at the position the user selects. Copying it to another map duplicates it into a separate event.

This keeps events:

- **independent**: each one has its own state, such as whether an item has been picked up;
- **easy to find**: each one is where it acts in the game;
- **safe to edit**: changing one never affects its copies.

For sharing an event across several maps, see [Event templates](templates.md).
