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

Play audio lets users play an audio file on one of the four audio channels.

### Parameters

| Parameter | Description |
| --- | --- |
| Audio channel | The channel to play on. The default is Background music. |
| Audio file | The file to play. Select a file from the project or import one in the instruction editor. |
| Volume | The playback volume from 0% to 100%. The default is 100%. |
| Pitch | The playback pitch from 50% to 150%. The default is 100%, which preserves the original pitch. |

### Node

The node's body shows these fields in order.

1. Audio channel
2. Audio file
3. Volume
4. Pitch

The audio file is read-only on the node. Double-click the node to open the instruction editor and change the file.

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
