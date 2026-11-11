---
summary: The instructions that communicate with the player in writing, through messages and choices.
status: validated
last_reviewed: 2026-11-10
---

# Messages

The Messages category groups the instructions that communicate with the player in writing. Most events rely on them, whether to give a voice to a character, inform the player, or let them make a decision with consequences.

## Show message

Show message lets users display a message to the player.

### Parameters

| Parameter | Description |
| --- | --- |
| Message | The text the player reads |
| Allow skipping | Whether the player can close the message by walking away, without confirming it |
| Portraits | Images of the character who speaks, shown with the message |
| **Narrator** | |
| Narrator name | The name shown with the message, usually that of the character who speaks |
| Name color | The color of the narrator name |
| **Message box** | |
| Show the message box | Whether the message box appears |
| Message box position | Where the message box appears on the screen |
| Appearance | How the message box looks |
| **Other options** | |
| Look at this event | Whether the player turns to face the event that shows the message |

The following parameters support Quick Translation: **Message** and **Narrator name**.

### Node

From top to bottom, the node's body holds:

1. Narrator name
2. Message

### Ideas

- Users could format the text with built-in tools, rather than with codes typed into the Message field.
- The project could have its own list of characters, each with a name and portraits, from which users pick the narrator.
- A message could include an image inside its text, such as an item icon.
- Users could preview a message as the player will see it.

## Offer choice

Offer choice lets users ask the player to pick one option among several.

When Show message runs right before Offer choice, its message stays on screen while the player chooses.

### Parameters

| Parameter | Description |
| --- | --- |
| Choices | The options offered to the player, at least two |
| Result storage | The variable that stores the option the player picks |
| Choice position | Where the options appear on the screen |

The following parameter supports Quick Translation: **Choices**.

### Node

From top to bottom, the node's body holds:

1. Choices, each with its own [output port](../building-blocks/node.md#ports)
2. Cancel, an output port that is always present. Users connect it to the instructions that should run when the player cancels the choice.

### Ideas

- Some kinds of choices, such as yes or no, could have their own presentation.
