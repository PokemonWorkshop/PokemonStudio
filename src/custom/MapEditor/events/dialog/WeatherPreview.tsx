import React from 'react';
import styled from 'styled-components';
import { ZoomPan } from '../../ZoomPan';

/**
 * Fork-owned. Previews Set Weather (236) over a snapshot of the current map,
 * approximating PSDK's overworld weather (`902 Overworld Weather.rb`). Visual
 * types: 0 None, 1 Rain, 2 Sun, 3 Sandstorm, 4 Hail, 5 Fog. This is an
 * impression of the effect (canvas particles / tone), not a pixel-exact port.
 */

const Canvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
`;

type Props = {
  snapshotUrl: string | null;
  type: number; // 0..5
  power: number;
  height?: number;
};

type Particle = { x: number; y: number; vx: number; vy: number; len: number; r: number };

const mkParticle = (ty: number, w: number, h: number): Particle => {
  const jitter = () => 0.8 + Math.random() * 0.6;
  if (ty === 1) return { x: Math.random() * w, y: Math.random() * h, vx: -1.3 * jitter(), vy: 9 * jitter(), len: 12, r: 1 }; // rain
  if (ty === 3) return { x: Math.random() * w, y: Math.random() * h, vx: 7 * jitter(), vy: 0.6, len: 0, r: 1 }; // sandstorm
  if (ty === 4) return { x: Math.random() * w, y: Math.random() * h, vx: -0.4, vy: 3.2 * jitter(), len: 0, r: 1.6 }; // hail
  if (ty === 5) return { x: Math.random() * w, y: Math.random() * h, vx: 0.4 * jitter(), vy: 0, len: 0, r: 14 + Math.random() * 16 }; // fog blob
  return { x: 0, y: 0, vx: 0, vy: 0, len: 0, r: 1 };
};

const drawParticle = (ctx: CanvasRenderingContext2D, ty: number, p: Particle) => {
  if (ty === 1) {
    ctx.strokeStyle = 'rgba(174,194,224,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 0.6, p.y - p.len);
    ctx.stroke();
  } else if (ty === 3) {
    ctx.fillStyle = 'rgba(198,170,112,0.7)';
    ctx.fillRect(p.x, p.y, 2, 1);
  } else if (ty === 4) {
    ctx.fillStyle = 'rgba(224,238,248,0.9)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  } else if (ty === 5) {
    ctx.fillStyle = 'rgba(232,236,240,0.05)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const WeatherPreview: React.FC<Props> = ({ snapshotUrl, type, power, height = 320 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const snapRef = React.useRef<HTMLImageElement | null>(null);
  const [, force] = React.useReducer((n) => n + 1, 0);
  const paramsRef = React.useRef({ type, power });
  paramsRef.current = { type, power };
  const partsRef = React.useRef<Particle[]>([]);
  const partsKeyRef = React.useRef('');

  React.useEffect(() => {
    snapRef.current = null;
    if (!snapshotUrl) { force(); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { snapRef.current = img; force(); } };
    img.src = snapshotUrl;
    return () => { cancelled = true; };
  }, [snapshotUrl]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snap = snapRef.current;
    const w = snap?.naturalWidth || 480;
    const h = snap?.naturalHeight || 320;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ensureParticles = (ty: number, pw: number) => {
      // PSDK scales sprite count ~ (power+1)*4; keep it lighter for a small preview.
      const count = Math.min(240, Math.max(0, (pw + 1) * (ty === 5 ? 3 : 6)));
      const key = `${ty}:${count}:${w}x${h}`;
      if (partsKeyRef.current === key) return;
      partsKeyRef.current = key;
      const arr: Particle[] = [];
      for (let i = 0; i < count; i++) arr.push(mkParticle(ty, w, h));
      partsRef.current = arr;
    };

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      const { type: ty, power: pw } = paramsRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      if (snap) ctx.drawImage(snap, 0, 0, w, h);
      else { ctx.fillStyle = '#20242c'; ctx.fillRect(0, 0, w, h); }

      // Flat tone washes for the non-particle / hazy weathers.
      if (ty === 2) { ctx.fillStyle = 'rgba(255,190,90,0.22)'; ctx.fillRect(0, 0, w, h); } // sun/zenith
      else if (ty === 3) { ctx.fillStyle = 'rgba(200,170,110,0.20)'; ctx.fillRect(0, 0, w, h); } // sandstorm haze
      else if (ty === 5) { ctx.fillStyle = 'rgba(218,224,230,0.30)'; ctx.fillRect(0, 0, w, h); } // fog haze

      if (ty !== 0 && ty !== 2) {
        ensureParticles(ty, pw);
        const f = dt / 16.67;
        for (const p of partsRef.current) {
          p.x += p.vx * f;
          p.y += p.vy * f;
          if (p.y > h + 12) { p.y = -12; p.x = Math.random() * w; }
          if (p.x > w + 20) p.x = -20;
          else if (p.x < -20) p.x = w + 20;
          drawParticle(ctx, ty, p);
        }
      } else {
        partsKeyRef.current = '';
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotUrl, snapRef.current]);

  if (!snapshotUrl) return null;
  return (
    <ZoomPan height={height} resetKey={snapshotUrl}>
      <Canvas ref={canvasRef} />
    </ZoomPan>
  );
};
