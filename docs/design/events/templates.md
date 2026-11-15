---
summary: Event templates, to change in one place what several events have in common.
status: draft
last_reviewed: 2026-10-31
---

# Event templates

> 🚧 **This subject is still being explored. Nothing on this page is settled.**

An event template is a model for events: it is defined once, and events are created from it.

Each event [belongs to its map](architecture.md#scope), and its copies are independent. Templates are meant for the opposite need: changing in one place what several events have in common.

Templates would take over the role of RPG Maker XP's common events, which several events can call.

## Open questions

- When a template changes, should the events created from it be updated automatically, or only when the user chooses?
- Can an event created from a template be changed on its own? Only through the parameters the template leaves open, or freely?
- Can an event be detached from its template and stop receiving its changes?

## Ideas

- A template would never be placed on a map: choosing it when adding an event to a map would create an event from it.
- The parameters a template leaves open could include sequences of instructions.
- An existing event could be turned into a template.
- Users could see every event created from a template.
