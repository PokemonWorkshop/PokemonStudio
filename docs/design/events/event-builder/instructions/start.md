---
summary: The instructions that define when and how the sequences of an event start.
status: validated
last_reviewed: 2026-10-31
---

# Start

The Start category groups the instructions that define how the [sequences](../visual-scripting.md) of an event start. They answer the first question users ask about an event: when does it happen?

## Start event sequence

Start event sequence lets users choose what triggers a sequence, and which sequence starts first when several are triggered at once. An event without a Start event sequence never runs.

### Parameters

| Parameter | Description |
| --- | --- |
| Trigger | The circumstance that starts the sequence |
| Priority order | The rank of this sequence among those of its event |

#### Trigger

> 🚧 **The exact description of each trigger is still being explored. Their names may change to make them clearer.**

| Trigger | Description |
| --- | --- |
| Key action | |
| Contact | |
| Overlap | |
| Before any transition | |
| Called | |
| Runs in parallel | |
| Cutscene | |

#### Priority order

Priority order gives each Start event sequence of an event a rank, from 1 up to the number of Start event sequences in the event.

When several sequences are triggered at the same moment, they start in increasing order of rank. For example, if only the sequences ranked 2, 4, and 5 are triggered, the sequence ranked 2 starts first, then 4, then 5.

Removing a Start event sequence moves each one ranked after it up one rank. Ranks always run from 1, without gaps.

### Conditions

> 🚧 **Besides its trigger, a sequence also depends on conditions, which are still being explored.**

These conditions would rely on the [Condition Builder](../building-blocks/condition-builder.md).

### Node

From top to bottom, the node's body holds:

1. Trigger

The node's footer holds Priority order. The node has no [input port](../building-blocks/node.md#ports): Start event sequence always begins a sequence.
