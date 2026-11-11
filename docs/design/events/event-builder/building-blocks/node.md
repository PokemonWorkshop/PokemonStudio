---
summary: "How an instruction is represented on the canvas: its parts, how users edit it, and its actions."
status: validated
last_reviewed: 2026-10-31
---

# Node

A node represents an instruction on the canvas.

## Anatomy

A node has three areas:

- the **header** identifies the instruction with its name and the icon and color of its category;
- the **body** holds the instruction's main parameters, which make the logic of the event readable at a glance. Its height adapts to them, and a complex parameter appears there as a short summary;
- the **footer** holds additional information and actions, such as the node's [errors](#errors) and [comments](#comments).

### Ports

Ports are how nodes connect to one another: a connection leaves a node through an output port and enters the next node through an input port.

Most nodes have an input port on the left of their header and an output port on its right. An instruction with several outcomes, such as a [choice](../instructions/messages.md#offer-choice), has no output port on its header: it lists its outcomes in its body, each with its own output port. [Start event sequence](../instructions/start.md) has no input port: it always begins a sequence.

For how to connect nodes, see [Visual scripting](../visual-scripting.md).

### Ideas

- The header could show an icon specific to each instruction, in the color of its category.

## Edit a node

An instruction can offer many parameters, and users can edit every one of them. The main ones are set directly in the node, and all of them can be edited in a **drawer** that opens from the node, as in other parts of Pokémon Studio.

Users open the drawer by double-clicking the node, or from its [toolbar](#node-actions). Clicking the summary of a complex parameter opens the drawer directly on that parameter.

A parameter edited in the drawer is updated in the node, and vice versa.

For the parameters that appear on the node of each instruction, see the page of its category in [Instructions](../instructions/README.md).

## Node actions

Beyond editing its parameters, users can act on the node itself, for example to duplicate or delete it, alone or with other selected nodes.

These actions stay out of sight until users need them, which keeps the canvas uncluttered. The most common appear in a **toolbar**: a compact one while users hover over the node, and a full one once they select it. Secondary actions, such as copying, are in the node's **context menu**.

### Ideas

- Users could disable a node: it would keep its connections, but its sequence would skip it.
- Users could collapse a node, hiding its body.
- Users could run the game from a node.
- Users could group nodes.

## Errors

When an instruction has an error, such as a missing value, the footer of its node [states the problem](../../../foundations/principles.md#clear-accessible-feedback).

### Open questions

- Does a node with an error block exporting the game?

## Comments

Users can attach comments to a node, to leave notes about its instruction. They add and read them from the node's footer, which indicates how many comments the node has.

### Open questions

- Does the footer give access to comments even when a node has none? If so, the footer is never empty.

### Ideas

- A comment could be pinned on the canvas, under its node.
