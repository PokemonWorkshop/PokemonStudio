---
summary: The guidelines for writing design pages, in addition to the general contribution guide.
status: validated
last_reviewed: 2026-11-08
---

# Contributing to the design documentation

This guide gives the guidelines specific to design pages. For the guidelines that apply to every discipline, see the [contribution guide](../contributing.md). For the guidelines specific to instruction pages, see the [instruction guidelines](events/event-builder/instructions/contributing.md).

## Describe the design, not the implementation

Design pages describe how Pokémon Studio is designed, not how it is built: a design stays true when the code that implements it changes. Leave implementation details to the [engineering documentation](../engineering/README.md).

Write from the users' point of view: start from what they need, then describe how Pokémon Studio meets that need.

Do not link to code or pull requests from a design page.

## Link to Figma for visuals

Figma holds the visual reference for Pokémon Studio: exact layouts, components, and visual details. Link to the relevant Figma frames instead of describing visuals in detail.

## Flag what is still being explored

In design pages, flag a subject that is still being explored with a quote, in addition to the headings described in [Flag what is still open](../contributing.md#flag-what-is-still-open).

When part of a page is still being explored, open its section with a quote that says so, in the form `> 🚧 **… is still being explored.**`.

When the whole subject of a page is still being explored, open the page with `> 🚧 **This subject is still being explored. Nothing on this page is settled.**`, and keep the page `draft`.

In both cases, the section or page holds only what is known about its subject, such as its purpose, what is planned, and ideas. It can be very short. It gives the subject its place in the documentation before it is designed, without anyone mistaking an idea for a decision.

Once the subject is designed, describe it and remove the quote.
