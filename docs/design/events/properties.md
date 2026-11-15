---
summary: An event's initial settings, and how existing projects keep theirs.
status: draft
last_reviewed: 2026-10-31
---

# Event Properties

Event Properties are the **initial settings** of an event. While the game runs, instructions can change some of them.

An event's name serves as a readable label, not as a place to [hide](../foundations/principles.md#explicit-over-implicit) settings.

## Properties

> 🚧 **How these properties are named and presented is still being explored.**

The properties must cover the settings that existing projects already rely on, including:

- **Appearance**: the graphic and its direction.
- **Movement**: the movement the event follows on its own, the walking and idle animations, a fixed direction while moving, passing through everything, forced surfing, and no sliding on ice.
- **Display**: the display layer, appearing above everything, raising the event by one level, a shadow, a realistic shadow, reflections, the horizontal and vertical sprite offsets, no sprite, invisibility, and the invisible object setting.
- **Environment**: no particles.

## Migration

In existing projects, Pokémon SDK reads some settings from keywords written in an event's name. When a project is migrated, the settings recognized in an event's name become properties, where possible, and leave the name. Unrecognized settings stay in the name, so that nothing is [lost](../foundations/principles.md#safe-migration).

For example, an event named `§ [z=2][offset_y=-8]NPC Guard` is renamed `NPC Guard`, and its shadow (`§`), display layer (`[z=2]`), and vertical offset (`[offset_y=-8]`) become properties.

## Ideas

- Plugins could add their own properties.
- Further properties could include:
  - **Display**: a custom display priority, visibility rules, and custom sprite anchors;
  - **Movement**: ignoring collisions with the player, followers, or other characters, and locking movement or direction;
  - **Environment**: no weather, grass, terrain, or bridge effects;
  - **Gameplay**: persistent state, marking an event as decorative or non-interactive, and custom save behavior;
  - **Audio**: custom or no footsteps, and ambient sounds;
  - **Testing**: showing collisions, triggers, and movement paths, and events that exist only while testing.
