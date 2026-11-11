---
summary: The instructions that control the music and sounds of the game.
status: validated
last_reviewed: 2026-10-30
---

# Audio

The Audio category groups the instructions that control the music and sounds of the game.

The game's music and sounds play on four channels, which the instructions of this category refer to:

| Channel | Description |
| --- | --- |
| Background music | Music that plays continuously on a map |
| Background sounds | Ambient sounds, such as rain, that play alongside the background music |
| Music effects | Short jingles that interrupt the background music |
| Sound effects | Brief sounds |

## Play audio

> 🚧 **This instruction is still being explored.**

Play audio lets users play music or a sound.

## Stop audio

Stop audio lets users stop the music and sounds that are playing.

### Parameters

| Parameter | Description |
| --- | --- |
| Audio channels to stop | The channels to stop, any of: Background music, Background sounds, Music effects, and Sound effects |
| Fading time | The time, in seconds, the audio takes to fade out |

Sound effects stop at once, without fading. Stopping them also stops creature cries.

### Node

From top to bottom, the node's body holds:

1. Audio channels to stop

## Change default audio

> 🚧 **This instruction is still being explored.**

Change default audio lets users change the music or sounds that the game plays by default in some situations, such as battles.

## Memorize background audio

Memorize background audio lets users memorize the background music and sounds that are playing, to restore them later.

### Parameters

| Parameter | Description |
| --- | --- |
| Audio channels to memorize | The channels to memorize, any of: Background music and Background sounds |

### Node

From top to bottom, the node's body holds:

1. Audio channels to memorize

## Restore background audio

Restore background audio lets users bring back the background music and sounds memorized earlier.

### Parameters

| Parameter | Description |
| --- | --- |
| Audio channels to restore | The channels to restore, any of: Background music and Background sounds |

### Node

From top to bottom, the node's body holds:

1. Audio channels to restore

## Ideas

- **Play creature cry** could let users play the cry of a creature.
