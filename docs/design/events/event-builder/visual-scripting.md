---
summary: The rules for building and reading sequences on the canvas.
status: validated
last_reviewed: 2026-10-31
---

# Visual scripting

Visual scripting replaces lines of code with connected instructions. On the canvas, each instruction appears as a [node](building-blocks/node.md), and the connections between nodes set the order in which they run.

A **sequence** begins with a [Start event sequence](instructions/start.md) instruction and follows these connections from node to node. An event can have several sequences.

A sequence can split into several **paths**, for example one per option of a choice, and paths can join again on a later node.

Each sequence keeps the linear logic of a script, one instruction after another, while users arrange its nodes freely on the canvas.

## Read an event

Users can always see when and why an event starts, the order in which its instructions run, and where each path leads.

A node's position makes the event easier to read, but only connections set the order: moving a node never changes what the event does.

### Ideas

- The canvas could highlight the paths leaving a node when users hover over it, to make the order of instructions easier to follow.

## Build a sequence

Users add instructions from the [Instruction Library](README.md#instruction-library) and place them freely on the canvas. Nodes always snap to a grid and never overlap, helping users align them and keep the event easy to read.

Users connect nodes by linking an [output port](building-blocks/node.md#ports) to an input port:

- each output port leads to a single node;
- an input port can receive several connections, where paths join.

Users can also add an instruction from a port: clicking it, or dropping a connection they are drawing on an empty area of the canvas, opens a compact version of the Instruction Library.

A node outside any sequence does nothing.

### Open questions

- Does a node outside any sequence show its errors?
- How do paths that return to an earlier node appear, for example when a choice is canceled?
- How can users build a sequence from the keyboard?
- How do users place the labels that [Go to label](instructions/flow-control.md#go-to-label) jumps to, and how does the jump appear on the canvas, given that only connections set the order?
