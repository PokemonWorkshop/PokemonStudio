---
summary: The principles that guide design decisions in Pokémon Studio.
status: validated
last_reviewed: 2026-10-31
---

# Design principles

These principles turn the [Product vision](vision.md) into rules for design decisions. 

## Product behavior

### Explicit over implicit

Behavior that affects the game is visible in the interface. Defaults can save repetition, but they never hide a rule.

### Progressive complexity

Common tasks are easy to approach, and advanced use is never blocked. Everyday work requires no knowledge of Ruby. What the interface does not cover yet remains possible through scripting.

### Safe migration

Migrating an existing project preserves its data wherever possible, and never loses any of it silently.

## Interface

### User goals before technical structure

Navigation and terminology follow what users want to create, not how the engine or Pokémon Studio itself is organized internally.

### Consistent systems

Shared concepts, components, and patterns work the same way throughout the product.

### Clear, accessible feedback

- Information never relies on color alone.
- An error states what is wrong and how to fix it.
- Incomplete elements stay visible and are marked as such.
