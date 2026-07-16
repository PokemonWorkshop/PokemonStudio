import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@src/GlobalStateProvider';
import { Dim, OpBtn, Row, SearchInput, SmallInput } from './styles';

/**
 * One audio file on disk. RMXP stores the BARE name (no folder, no extension) —
 * that's what goes in the rxdata — but playing a preview needs the real
 * filename, because the `project://` protocol does no extension fallback for
 * audio (only images get one). So both are carried.
 */
export type AudioFile = { name: string; file: string };

const List = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 168px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.dark18};
`;

const Item = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border: none;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  ${({ theme, $selected }) => `
    background: ${$selected ? theme.colors.primaryBase : 'transparent'};
    color: ${$selected ? theme.colors.text100 : theme.colors.text400};
  `}

  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primaryBase : theme.colors.dark22)};
  }
`;

const Empty = styled.div`
  padding: 10px 8px;
  color: ${({ theme }) => theme.colors.text400};
`;

type Props = {
  /** Files in the folder being browsed. */
  files: AudioFile[];
  /** Audio subfolder, e.g. 'se' — used to build the preview URL. */
  folder: string;
  /** The BARE name currently chosen ('' = none). */
  value: string;
  volume: number;
  pitch: number;
  onChange: (name: string) => void;
  onVolumeChange: (volume: number) => void;
  onPitchChange: (pitch: number) => void;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const readAudioBytes = (projectPath: string, folder: string, file: string) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    window.api.readAudioBytes({ projectPath, folder, file }, ({ bytes }) => resolve(bytes), ({ errorMessage }) => reject(new Error(errorMessage)));
  });

/**
 * Searchable audio file list with a preview that matches how PSDK plays the SE.
 *
 * PSDK pitch is a RESAMPLE — both drivers do `set_pitch(pitch/100.0)`, and SFML
 * and FMOD both change playback SPEED along with tone (like a record spun
 * faster). An <audio> element's `playbackRate` is meant to do that too, but its
 * `preservesPitch` flag (default ON = time-stretch) fought us and wasn't
 * reliably disablable. The Web Audio API has no such flag: an
 * AudioBufferSourceNode's `playbackRate` ALWAYS resamples, exactly like the
 * engine. So we decode the file once and play it through one, with a GainNode
 * for volume — pitch 90 is slower AND lower, matching in-game.
 */
export const AudioPicker = ({ files, folder, value, volume, pitch, onChange, onVolumeChange, onPitchChange }: Props) => {
  const { t } = useTranslation();
  const [{ projectPath }] = useGlobalState();
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState(false);

  const selected = files.find((f) => f.name === value);

  // Web Audio graph, kept in refs so live volume/pitch edits reach a playing note.
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<{ file: string; buffer: AudioBuffer } | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setPlaying(false);
  };

  // Selecting a different file, or clearing it, cancels any preview in flight.
  useEffect(() => stop(), [value]);
  // Tear the context down when the picker unmounts.
  useEffect(() => () => void ctxRef.current?.close().catch(() => undefined), []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;
    return files.filter((f) => f.name.toLowerCase().includes(query));
  }, [files, search]);

  // Live: dragging volume/pitch while a note plays updates it immediately.
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = clamp(volume, 0, 100) / 100;
    if (sourceRef.current) sourceRef.current.playbackRate.value = clamp(pitch, 50, 150) / 100;
  }, [volume, pitch]);

  const togglePreview = async () => {
    if (playing) {
      stop();
      return;
    }
    if (!selected || !projectPath) return;

    // The button click is the user gesture that lets the context start.
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // Decode once per file, then reuse the buffer for repeated / re-pitched plays.
    if (bufferRef.current?.file !== selected.file) {
      try {
        const bytes = await readAudioBytes(projectPath, folder, selected.file);
        bufferRef.current = { file: selected.file, buffer: await ctx.decodeAudioData(bytes) };
      } catch {
        return; // missing or undecodable file — the button just does nothing
      }
    }

    stop();
    const source = ctx.createBufferSource();
    source.buffer = bufferRef.current.buffer;
    source.playbackRate.value = clamp(pitch, 50, 150) / 100;
    const gain = ctx.createGain();
    gain.gain.value = clamp(volume, 0, 100) / 100;
    source.connect(gain).connect(ctx.destination);
    source.onended = () => {
      if (sourceRef.current === source) {
        sourceRef.current = null;
        setPlaying(false);
      }
    };
    sourceRef.current = source;
    gainRef.current = gain;
    source.start();
    setPlaying(true);
  };

  return (
    <>
      <Row>
        <SearchInput
          value={search}
          placeholder={t('me_events_audio_search')}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </Row>
      <List>
        {filtered.length === 0 ? (
          <Empty>{files.length === 0 ? t('me_events_audio_none') : t('me_events_audio_no_match')}</Empty>
        ) : (
          filtered.map((f) => (
            <Item key={f.file} type="button" $selected={f.name === value} onClick={() => onChange(f.name)}>
              <span>{f.name}</span>
            </Item>
          ))
        )}
        {/* A name stored by RMXP whose file is gone must stay selectable, or
            opening the form would silently drop it. */}
        {value !== '' && !selected && (
          <Item type="button" $selected onClick={() => undefined}>
            <span>{t('me_events_audio_missing', { name: value })}</span>
          </Item>
        )}
      </List>
      <Row>
        <OpBtn type="button" onClick={togglePreview} disabled={!selected} title={t('me_events_audio_preview_hint')}>
          {playing ? `⏹ ${t('me_events_audio_stop')}` : `▶ ${t('me_events_audio_preview')}`}
        </OpBtn>
        <Dim>{t('me_events_audio_volume')}</Dim>
        <SmallInput type="number" min={0} max={100} value={volume} onChange={(e) => onVolumeChange(clamp(Number(e.target.value) || 0, 0, 100))} />
        <Dim>{t('me_events_audio_pitch')}</Dim>
        <SmallInput type="number" min={50} max={150} value={pitch} onChange={(e) => onPitchChange(clamp(Number(e.target.value) || 100, 50, 150))} />
      </Row>
    </>
  );
};
