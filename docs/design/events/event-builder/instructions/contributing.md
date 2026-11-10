---
summary: The guidelines for describing instructions, in addition to the design guidelines.
status: validated
last_reviewed: 2026-11-10
---

# Contributing to instruction pages

This guide gives the guidelines specific to instruction pages. For the guidelines that apply to every design page, see the [design guidelines](../../../contributing.md).

## Describe an instruction

Each instruction has its own section in the page of its category. Start from this template:

```markdown
## <Instruction name>

<Instruction name> lets users <what the instruction lets them do>.

### Parameters

| Parameter | Description |
| --- | --- |
| <Field name> | <What the field sets> |

### Node

From top to bottom, the node's body holds:

1. <Field name>
```

List the parameters as users see them in the instruction's editor: one row per field, in the same order. A group of fields is a row in bold, with no description. Keep each description to one short line.

When some parameters can be translated, name them in a sentence after the table, in the form `The following parameters support Quick Translation: <Field name> and <Field name>.`

In the node's list, use the same names as in the table. When an instruction has no parameters, replace both subsections with `<Instruction name> has no parameters, and its node has no body.`

Each section must make sense on its own: do not describe an instruction by referring to another one.

## Describe an instruction that is not designed yet

When an instruction is still being explored, open its section with `> 🚧 **This instruction is still being explored.**`, as described in [Flag what is still being explored](../../../contributing.md#flag-what-is-still-being-explored).

To suggest a new instruction, add it to the Ideas section of its category page, in the form `**<Instruction name>** could let users <what it would let them do>.`

## Naming conventions

Users find an instruction by its name, in the [Instruction Library](../README.md#instruction-library) and on the canvas. Its name alone must say what the instruction does.

Follow these conventions:

- Name a category with a noun, in the plural when it groups things that can be counted. For example, Battles, but Audio.
- Name an instruction with a verb and its object, without an article. For example, Show message, not Show a message.
- Use the same verb for the same action across all instructions. For example, instructions always use Show, never Display.
- Use the same set of choices for the same meaning. For example, an access always offers Allow, Deny, or Toggle, and a setting that turns something on or off offers Enable, Disable, or Toggle.

Write names in sentence case, as described in the [writing conventions](../../../../contributing.md#writing-conventions).
