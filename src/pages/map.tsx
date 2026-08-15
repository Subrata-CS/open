import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import sectionsData from '@site/src/data/sections.json';
import topicsData from '@site/src/data/topics.json';
import tracksData from '@site/src/data/tracks.json';
import stats from '@site/src/data/stats.json';
import { PROGRESS_EVENT, isDone } from '@site/src/lib/progress';
import { toneOf } from '@site/src/lib/tones';
import styles from './map.module.css';

/**
 * The whole syllabus on one screen.
 *
 * Six tracks radiate from the centre, each carrying its sections, each section
 * carrying its topics. Nothing here is hand-placed: the layout is computed from
 * the generated data, so a section added to the syllabus takes its place in the
 * map automatically.
 *
 * Drawn on a canvas rather than as elements because 578 nodes plus their edges
 * is far more than the browser will animate comfortably as DOM.
 */

type Section = { num: number; title: string; href: string; topics: number; track: string; tone: string };
type Topic = { title: string; href: string; section: string; sectionNum: number; track: string; tone: string };
type Track = { label: string; tone: string };

const SECTIONS = sectionsData as Section[];
const TOPICS = topicsData as Topic[];
const TRACKS = tracksData as Track[];

type Node = {
  kind: 'centre' | 'track' | 'section' | 'topic';
  label: string;
  href?: string;
  x: number;
  y: number;
  r: number;
  colour: string;
  rgb: string;
  parent: number;
  track: string;
  done?: boolean;
};

/** Lay the whole syllabus out as a radial tree, in data order. */
function layout(): Node[] {
  const nodes: Node[] = [];
  nodes.push({
    kind: 'centre', label: 'Computer Science', x: 0, y: 0, r: 26,
    colour: '#c4b5fd', rgb: '196, 181, 253', parent: -1, track: '',
  });

  const trackAngle = new Map<string, number>();
  const span = (Math.PI * 2) / TRACKS.length;

  TRACKS.forEach((track, t) => {
    const angle = t * span - Math.PI / 2;
    trackAngle.set(track.label, angle);
    const tone = toneOf(track.tone);
    const trackIndex = nodes.length;
    nodes.push({
      kind: 'track', label: track.label,
      x: Math.cos(angle) * 190, y: Math.sin(angle) * 190,
      r: 15, colour: tone.base, rgb: tone.rgb, parent: 0, track: track.label,
    });

    const sections = SECTIONS.filter((s) => s.track === track.label);
    sections.forEach((section, i) => {
      // fan the sections across the track's slice of the circle
      const spread = span * 0.82;
      const a = angle - spread / 2 + (spread * (i + 0.5)) / sections.length;
      const sectionIndex = nodes.length;
      nodes.push({
        kind: 'section', label: section.title, href: section.href,
        x: Math.cos(a) * 420, y: Math.sin(a) * 420,
        r: 8, colour: tone.base, rgb: tone.rgb, parent: trackIndex, track: track.label,
      });

      const topics = TOPICS.filter((t) => t.sectionNum === section.num);
      topics.forEach((topic, j) => {
        const inner = spread / sections.length;
        const ta = a - inner / 2 + (inner * (j + 0.5)) / topics.length;
        const radius = 560 + (j % 5) * 26;
        nodes.push({
          kind: 'topic', label: topic.title, href: topic.href,
          x: Math.cos(ta) * radius, y: Math.sin(ta) * radius,
          r: 2.6, colour: tone.base, rgb: tone.rgb, parent: sectionIndex, track: track.label,
        });
      });
    });
  });

  return nodes;
}

export default function KnowledgeMap(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();

  const [hover, setHover] = useState<Node | null>(null);
  const [track, setTrack] = useState('all');
  const [query, setQuery] = useState('');
  const [progressTick, setProgressTick] = useState(0);

  const nodes = useMemo(layout, []);

  const view = useRef({ scale: 0.52, x: 0, y: 0 });
  const drag = useRef({ on: false, x: 0, y: 0, moved: 0 });
  const screen = useRef<{ x: number; y: number; n: Node }[]>([]);
  const filter = useRef({ track: 'all', query: '' });

  useEffect(() => {
    filter.current = { track, query: query.trim().toLowerCase() };
  }, [track, query]);

  useEffect(() => {
    const refresh = () => setProgressTick((n) => n + 1);
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(PROGRESS_EVENT, refresh);
  }, []);

  const matches = useCallback((n: Node) => {
    const f = filter.current;
    if (f.track !== 'all' && n.track && n.track !== f.track) return false;
    if (f.query && !n.label.toLowerCase().includes(f.query)) return false;
    return true;
  }, []);

  /* ------------------------------------------------------------- drawing */

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    function draw() {
      if (!ctx) return;
      const { scale, x: ox, y: oy } = view.current;
      const cx = width / 2 + ox;
      const cy = height / 2 + oy;

      ctx.clearRect(0, 0, width, height);

      const at = (n: Node) => ({ x: cx + n.x * scale, y: cy + n.y * scale });
      const done = new Map<Node, boolean>();
      const visible = new Map<Node, boolean>();
      for (const n of nodes) {
        visible.set(n, matches(n));
        if (n.href) done.set(n, isDone(n.href));
      }

      // edges first, so nodes sit on top
      for (const n of nodes) {
        if (n.parent < 0) continue;
        const parent = nodes[n.parent];
        const on = visible.get(n) && visible.get(parent);
        const a = at(parent);
        const b = at(n);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = on
          ? `rgba(${n.rgb}, ${n.kind === 'topic' ? 0.14 : 0.36})`
          : 'rgba(120, 130, 170, 0.05)';
        ctx.lineWidth = n.kind === 'topic' ? 0.6 : 1.3;
        ctx.stroke();
      }

      screen.current = [];
      for (const n of nodes) {
        const p = at(n);
        const on = visible.get(n);
        const r = n.r * Math.max(0.65, Math.min(1.6, scale * 1.5));
        screen.current.push({ x: p.x, y: p.y, n });

        if (n.kind !== 'topic' || scale > 0.34) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + (n.kind === 'centre' ? 10 : 4), 0, Math.PI * 2);
          ctx.fillStyle = on ? `rgba(${n.rgb}, 0.16)` : 'rgba(120, 130, 170, 0.04)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = on
          ? done.get(n)
            ? '#34d399'
            : n.colour
          : 'rgba(120, 130, 170, 0.18)';
        ctx.fill();

        const labelled =
          n.kind === 'centre' ||
          n.kind === 'track' ||
          (n.kind === 'section' && scale > 0.42) ||
          (n.kind === 'topic' && scale > 1.15);

        if (labelled && on) {
          const size = n.kind === 'centre' ? 15 : n.kind === 'track' ? 13 : n.kind === 'section' ? 11 : 9;
          ctx.font = `${n.kind === 'topic' ? 500 : 700} ${size}px "Inter", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const ly = p.y - r - size * 0.75;
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = 'rgba(6, 9, 22, 0.92)';
          ctx.strokeText(n.label, p.x, ly);
          ctx.fillStyle = n.kind === 'centre' ? '#e9ecff' : n.kind === 'topic' ? 'rgba(214, 221, 250, 0.8)' : '#eef1ff';
          ctx.fillText(n.label, p.x, ly);
        }
      }
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = view.current.scale * (e.deltaY < 0 ? 1.12 : 0.89);
      view.current.scale = Math.max(0.2, Math.min(3, next));
      draw();
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    (canvas as HTMLCanvasElement & { __draw?: () => void }).__draw = draw;

    return () => {
      observer.disconnect();
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [matches, nodes, progressTick]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current as (HTMLCanvasElement & { __draw?: () => void }) | null;
    canvas?.__draw?.();
  }, []);

  useEffect(redraw, [track, query, redraw]);

  /* ------------------------------------------------------------ pointer */

  const nearest = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    let best: Node | null = null;
    let bestDist = 16;
    for (const p of screen.current) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = p.n;
      }
    }
    return best;
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (drag.current.on) {
        view.current.x += e.clientX - drag.current.x;
        view.current.y += e.clientY - drag.current.y;
        drag.current.moved += Math.abs(e.clientX - drag.current.x) + Math.abs(e.clientY - drag.current.y);
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
        redraw();
        return;
      }
      setHover(nearest(e.clientX, e.clientY));
    },
    [nearest, redraw],
  );

  return (
    <Layout
      title="Knowledge map"
      description={`All ${stats.topics} topics and ${stats.sections} sections on one interactive map.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>The whole syllabus</p>
          <h1 className={styles.title}>Knowledge map</h1>
          <p className={styles.lead}>
            All <b>{stats.sections}</b> sections and <b>{stats.topics}</b> topics at once,
            grouped by track. Drag to move, scroll to zoom, click any node to open it.
            Topics you have read turn green.
          </p>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Highlight topics containing…"
            aria-label="Highlight topics"
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Track">
            <option value="all">All tracks</option>
            {TRACKS.map((t) => (
              <option key={t.label} value={t.label}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              view.current = { scale: 0.52, x: 0, y: 0 };
              setQuery('');
              setTrack('all');
              redraw();
            }}>
            Reset view
          </button>
          <span className={styles.legend}>
            <i className={styles.dotDone} /> read
            <i className={styles.dotTodo} /> not yet
          </span>
        </div>

        <div className={styles.stage} ref={wrapRef}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            onPointerMove={onMove}
            onPointerDown={(e) => {
              drag.current = { on: true, x: e.clientX, y: e.clientY, moved: 0 };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerUp={(e) => {
              const moved = drag.current.moved;
              drag.current.on = false;
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {
                /* already released */
              }
              if (moved < 6) {
                const hit = nearest(e.clientX, e.clientY);
                if (hit?.href) history.push(withBaseUrl(hit.href));
              }
            }}
            onPointerLeave={() => {
              drag.current.on = false;
              setHover(null);
            }}
          />

          {hover && (
            <div className={styles.tip} style={{ borderColor: hover.colour }}>
              <b>{hover.label}</b>
              <small>{hover.kind}{hover.track ? ` · ${hover.track}` : ''}</small>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
