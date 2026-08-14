import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useHistory } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import sectionsData from '@site/src/data/sections.json';
import landData from '@site/src/data/land.json';
import { toneOf } from '@site/src/lib/tones';
import styles from './styles.module.css';

/**
 * A slowly turning globe with one node per syllabus section.
 *
 * Every node comes from `src/data/sections.json`, which `tools/generate.py`
 * rewrites from `syllabus.txt`. Add a section to the syllabus and a new node
 * appears here on its own — nothing in this file needs touching.
 *
 * Drag to spin it, hover a node to read its label, click to open the section.
 */

type SectionNode = {
  num: number;
  title: string;
  slug: string;
  href: string;
  topics: number;
  track: string;
  tone: string;
};

const SECTIONS = sectionsData as SectionNode[];

type Vec = { x: number; y: number; z: number };

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const SPIN = 0.00019; // radians per millisecond
const MAX_TILT = 1.15; // how far up or down the globe can be tipped

type LandMask = { top: number; step: number; rows: string[] };
const LAND = landData as LandMask;

/** Every land cell of the mask, pre-converted to a point on the unit sphere. */
const LAND_POINTS: Vec[] = (() => {
  const pts: Vec[] = [];
  LAND.rows.forEach((row, r) => {
    const latDeg = LAND.top - r * LAND.step;
    const lat = (latDeg * Math.PI) / 180;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== '#') continue;
      const lon = ((-180 + c * LAND.step) * Math.PI) / 180;
      pts.push({ x: cosLat * Math.cos(lon), y: sinLat, z: cosLat * Math.sin(lon) });
    }
  });
  return pts;
})();

/** Evenly spread points over a sphere — no clustering at the poles. */
function fibonacci(index: number, count: number): Vec {
  const y = 1 - (2 * (index + 0.5)) / count;
  const clamped = Math.max(-0.93, Math.min(0.93, y));
  const r = Math.sqrt(Math.max(0, 1 - clamped * clamped));
  const theta = index * GOLDEN;
  return { x: r * Math.cos(theta), y: clamped, z: r * Math.sin(theta) };
}

function rotate(p: Vec, spin: number, tilt: number): Vec {
  const cs = Math.cos(spin);
  const ss = Math.sin(spin);
  const x = p.x * cs + p.z * ss;
  const z = -p.x * ss + p.z * cs;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return { x, y: p.y * ct - z * st, z: p.y * st + z * ct };
}

/** Great-circle interpolation, so the arcs hug the surface. */
function slerp(a: Vec, b: Vec, t: number): Vec {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-4) return a;
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2 };
}

export default function Globe(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();

  const [focus, setFocus] = useState(0);
  const [hover, setHover] = useState(-1);

  // Everything the animation loop mutates lives in refs so React never
  // re-renders sixty times a second.
  const spinRef = useRef(0);
  const tiltRef = useRef(0.42);
  const dragRef = useRef<{ on: boolean; x: number; y: number; moved: number }>({
    on: false,
    x: 0,
    y: 0,
    moved: 0,
  });
  const pausedRef = useRef(false);
  const hoverRef = useRef(-1);
  const screenRef = useRef<{ x: number; y: number; z: number; r: number }[]>([]);

  const nodes = useMemo(
    () =>
      SECTIONS.map((section, i) => ({
        ...section,
        home: fibonacci(i, SECTIONS.length),
        colour: toneOf(section.tone),
      })),
    [],
  );

  const maxTopics = useMemo(
    () => Math.max(1, ...SECTIONS.map((s) => s.topics)),
    [],
  );

  /* ----------------------------------------------------------- pointer */

  const pointAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best = -1;
    let bestDist = 26;
    screenRef.current.forEach((p, i) => {
      if (p.z <= 0.02) return;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (dragRef.current.on) {
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;
        dragRef.current.x = e.clientX;
        dragRef.current.y = e.clientY;
        dragRef.current.moved += Math.abs(dx) + Math.abs(dy);
        spinRef.current += dx * 0.0075;
        tiltRef.current = Math.max(
          -MAX_TILT,
          Math.min(MAX_TILT, tiltRef.current + dy * 0.0065),
        );
        return;
      }
      const hit = pointAt(e.clientX, e.clientY);
      if (hit !== hoverRef.current) {
        hoverRef.current = hit;
        setHover(hit);
        pausedRef.current = hit !== -1;
      }
    },
    [pointAt],
  );

  const onDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { on: true, x: e.clientX, y: e.clientY, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { moved } = dragRef.current;
      dragRef.current.on = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      if (moved < 6) {
        const hit = pointAt(e.clientX, e.clientY);
        if (hit !== -1) history.push(withBaseUrl(nodes[hit].href));
      }
    },
    [history, nodes, pointAt, withBaseUrl],
  );

  const leave = useCallback(() => {
    hoverRef.current = -1;
    setHover(-1);
    pausedRef.current = false;
    dragRef.current.on = false;
  }, []);

  /* ------------------------------------------------------------ render */

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let size = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.max(240, Math.min(wrap.clientWidth, 600));
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let sinceFocus = 0;
    let frame = 0;

    const draw = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      if (!pausedRef.current && !dragRef.current.on && !still) {
        spinRef.current += dt * SPIN;
      }
      frame += dt;

      const cx = size / 2;
      const cy = size / 2;
      const R = size * 0.395;
      const spin = spinRef.current;
      const tilt = tiltRef.current;

      ctx.clearRect(0, 0, size, size);

      // --- body ------------------------------------------------------
      const body = ctx.createRadialGradient(
        cx - R * 0.38,
        cy - R * 0.45,
        R * 0.12,
        cx,
        cy,
        R * 1.02,
      );
      body.addColorStop(0, 'rgba(72, 86, 168, 0.42)');
      body.addColorStop(0.55, 'rgba(24, 32, 78, 0.42)');
      body.addColorStop(1, 'rgba(8, 12, 32, 0.62)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();

      // outer atmosphere
      const halo = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.28);
      halo.addColorStop(0, 'rgba(129, 140, 248, 0.20)');
      halo.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(165, 180, 252, 0.30)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const project = (v: Vec, lift = 1) => {
        const p = rotate(v, spin, tilt);
        return { sx: cx + p.x * R * lift, sy: cy - p.y * R * lift, z: p.z };
      };

      // --- continents --------------------------------------------------
      for (const point of LAND_POINTS) {
        const p = project(point);
        if (p.z <= 0.02) continue;
        const depth = Math.min(1, p.z);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 0.7 + depth * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 190, 255, ${0.08 + depth * 0.34})`;
        ctx.fill();
      }

      // --- graticule --------------------------------------------------
      ctx.lineWidth = 1;
      const STEPS = 72;

      for (let m = 0; m < 12; m++) {
        const lon = (m / 12) * Math.PI * 2;
        ctx.beginPath();
        let open = false;
        for (let i = 0; i <= STEPS; i++) {
          const lat = -Math.PI / 2 + (i / STEPS) * Math.PI;
          const v = {
            x: Math.cos(lat) * Math.cos(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(lon),
          };
          const p = project(v);
          if (p.z > 0) {
            if (open) ctx.lineTo(p.sx, p.sy);
            else {
              ctx.moveTo(p.sx, p.sy);
              open = true;
            }
          } else {
            open = false;
          }
        }
        ctx.strokeStyle = 'rgba(148, 163, 220, 0.10)';
        ctx.stroke();
      }

      for (let k = 1; k < 8; k++) {
        const lat = -Math.PI / 2 + (k / 8) * Math.PI;
        ctx.beginPath();
        let open = false;
        for (let i = 0; i <= STEPS; i++) {
          const lon = (i / STEPS) * Math.PI * 2;
          const v = {
            x: Math.cos(lat) * Math.cos(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(lon),
          };
          const p = project(v);
          if (p.z > 0) {
            if (open) ctx.lineTo(p.sx, p.sy);
            else {
              ctx.moveTo(p.sx, p.sy);
              open = true;
            }
          } else {
            open = false;
          }
        }
        ctx.strokeStyle =
          k === 4 ? 'rgba(165, 180, 252, 0.22)' : 'rgba(148, 163, 220, 0.09)';
        ctx.stroke();
      }

      // --- arcs between consecutive sections ---------------------------
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const sameTrack = a.track === b.track;
        ctx.beginPath();
        let open = false;
        let visible = 0;
        for (let s = 0; s <= 24; s++) {
          const t = s / 24;
          const lift = 1 + 0.07 * Math.sin(Math.PI * t);
          const p = project(slerp(a.home, b.home, t), lift);
          if (p.z > -0.05) {
            visible += 1;
            if (open) ctx.lineTo(p.sx, p.sy);
            else {
              ctx.moveTo(p.sx, p.sy);
              open = true;
            }
          } else {
            open = false;
          }
        }
        if (visible > 1) {
          ctx.strokeStyle = sameTrack
            ? `rgba(${a.colour.rgb}, 0.26)`
            : 'rgba(148, 163, 220, 0.10)';
          ctx.lineWidth = sameTrack ? 1.1 : 0.9;
          ctx.stroke();
        }
      }

      // --- nodes -------------------------------------------------------
      const projected = nodes.map((n, i) => {
        const p = project(n.home, 1.005);
        return { ...p, i, n };
      });
      screenRef.current = projected.map((p) => ({
        x: p.sx,
        y: p.sy,
        z: p.z,
        r: 10,
      }));

      projected.sort((a, b) => a.z - b.z);

      let leading = { z: -2, i: 0 };
      projected.forEach(({ sx, sy, z, i, n }) => {
        if (z > leading.z) leading = { z, i };
        if (z <= -0.05) return;

        const depth = Math.max(0, Math.min(1, (z + 0.05) / 1.05));
        const weight = 0.45 + 0.55 * (n.topics / maxTopics);
        const active = hoverRef.current === i;
        const r = (active ? 6.4 : 3.1 + weight * 2.6) * (0.55 + 0.45 * depth);
        const alpha = active ? 1 : 0.25 + 0.75 * depth;

        // pulse travels around the sphere so the map always feels alive
        const phase = (frame / 2600 + i / nodes.length) % 1;
        const pulse = phase < 0.12 ? 1 - phase / 0.12 : 0;

        if (pulse > 0 || active) {
          ctx.beginPath();
          ctx.arc(sx, sy, r + (active ? 9 : 7 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${n.colour.rgb}, ${
            (active ? 0.22 : 0.16 * pulse) * (0.4 + 0.6 * depth)
          })`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = active ? n.colour.line : n.colour.base;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        if (active || depth > 0.93) {
          ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
          ctx.textBaseline = 'middle';
          const label = `${String(n.num).padStart(2, '0')} ${n.title}`;
          const flip = sx > cx;
          ctx.textAlign = flip ? 'right' : 'left';
          const lx = sx + (flip ? -(r + 8) : r + 8);

          if (active) {
            const w = ctx.measureText(label).width;
            const bx = flip ? lx - w - 8 : lx - 6;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(bx, sy - 10, w + 14, 20, 6);
            } else {
              ctx.rect(bx, sy - 10, w + 14, 20);
            }
            ctx.fillStyle = 'rgba(10, 14, 32, 0.86)';
            ctx.fill();
            ctx.strokeStyle = `rgba(${n.colour.rgb}, 0.5)`;
            ctx.stroke();
          }

          ctx.fillStyle = active
            ? n.colour.line
            : `rgba(203, 213, 245, ${0.2 + 0.65 * (depth - 0.93) * 14})`;
          ctx.fillText(label, lx, sy);
        }
      });

      // The readout under the globe follows whichever node is facing us.
      sinceFocus += dt;
      if (sinceFocus > 260) {
        sinceFocus = 0;
        const next = hoverRef.current === -1 ? leading.i : hoverRef.current;
        setFocus((prev) => (prev === next ? prev : next));
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [maxTopics, nodes]);

  const shown = nodes[hover === -1 ? focus : hover] ?? nodes[0];

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div
        className={styles.stage}
        style={{ '--node': shown?.colour.base } as CSSProperties}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerLeave={leave}
          role="img"
          aria-label={`Globe showing all ${SECTIONS.length} syllabus sections`}
        />
      </div>

      <div className={styles.readout} aria-live="polite">
        <span className={styles.num}>{String(shown?.num ?? 1).padStart(2, '0')}</span>
        <span className={styles.meta}>
          <b>{shown?.title}</b>
          <small>
            {shown?.track} · {shown?.topics} topics
          </small>
        </span>
      </div>
    </div>
  );
}
