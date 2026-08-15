import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * A live diagram for a section landing page — something the reader can move.
 *
 * Reading that gradient descent "fits a line" is not the same as dragging a
 * slope and watching the error rise. Each kind here is a small, honest model
 * of the idea rather than a decoration: the numbers shown are computed from
 * what is on screen.
 *
 * Which diagram a section gets is decided by its slug, so a new section picks
 * one up automatically.
 */

export type DiagramKind = 'regression' | 'sorting' | 'search' | 'binary';

const BY_KEYWORD: [RegExp, DiagramKind][] = [
  [/machine-learning|deep|neural|data-science|statistic|probabilit|regression|mining|artificial/, 'regression'],
  [/algorithm|data-structures|sorting|discrete|theory|compiler|parallel/, 'sorting'],
  [/database|retrieval|search|nlp|llm|rag|information/, 'search'],
  [/fundamentals|organization|number|binary|architecture|embedded|operating|network/, 'binary'],
];

export function diagramFor(slug: string): DiagramKind {
  for (const [pattern, kind] of BY_KEYWORD) if (pattern.test(slug)) return kind;
  return 'sorting';
}

/* ------------------------------------------------------------ regression */

const POINTS: [number, number][] = [
  [1, 35], [2, 42], [3, 51], [4, 58], [5, 67], [6, 72], [7, 81], [8, 88],
];

function Regression(): ReactNode {
  const [slope, setSlope] = useState(4);
  const [intercept, setIntercept] = useState(45);

  const best = useMemo(() => {
    const n = POINTS.length;
    const mx = POINTS.reduce((s, [x]) => s + x, 0) / n;
    const my = POINTS.reduce((s, [, y]) => s + y, 0) / n;
    const m =
      POINTS.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) /
      POINTS.reduce((s, [x]) => s + (x - mx) ** 2, 0);
    return { m, c: my - m * mx };
  }, []);

  const error = useMemo(
    () => POINTS.reduce((s, [x, y]) => s + (slope * x + intercept - y) ** 2, 0) / POINTS.length,
    [slope, intercept],
  );
  const bestError = useMemo(
    () => POINTS.reduce((s, [x, y]) => s + (best.m * x + best.c - y) ** 2, 0) / POINTS.length,
    [best],
  );

  const px = (x: number) => 40 + (x / 9) * 300;
  const py = (y: number) => 190 - (y / 100) * 160;

  return (
    <>
      <svg viewBox="0 0 360 210" className={styles.canvas} role="img"
        aria-label="Scatter plot with an adjustable straight line">
        <line x1="40" y1="190" x2="345" y2="190" stroke="rgba(148,163,220,.35)" />
        <line x1="40" y1="20" x2="40" y2="190" stroke="rgba(148,163,220,.35)" />

        {POINTS.map(([x, y]) => (
          <line key={`e${x}`} x1={px(x)} y1={py(y)} x2={px(x)} y2={py(slope * x + intercept)}
            stroke="rgba(246,92,142,.55)" strokeWidth="1.5" />
        ))}

        <line x1={px(0)} y1={py(intercept)} x2={px(9)} y2={py(slope * 9 + intercept)}
          stroke="#a5b4fc" strokeWidth="2.5" />

        {POINTS.map(([x, y]) => (
          <circle key={x} cx={px(x)} cy={py(y)} r="4.5" fill="#22c58b" />
        ))}

        <text x="46" y="34" className={styles.svgLabel}>marks</text>
        <text x="300" y="204" className={styles.svgLabel}>hours</text>
      </svg>

      <div className={styles.controls}>
        <label>
          slope <b>{slope.toFixed(1)}</b>
          <input type="range" min="0" max="12" step="0.1" value={slope}
            onChange={(e) => setSlope(Number(e.target.value))} />
        </label>
        <label>
          intercept <b>{intercept.toFixed(0)}</b>
          <input type="range" min="0" max="70" step="1" value={intercept}
            onChange={(e) => setIntercept(Number(e.target.value))} />
        </label>
      </div>

      <p className={styles.readout}>
        mean squared error <b>{error.toFixed(1)}</b> — the best possible fit here is{' '}
        <b>{bestError.toFixed(1)}</b> at slope {best.m.toFixed(2)}, intercept{' '}
        {best.c.toFixed(1)}.{' '}
        <button type="button" className={styles.mini}
          onClick={() => { setSlope(Number(best.m.toFixed(1))); setIntercept(Math.round(best.c)); }}>
          Snap to the best fit
        </button>
      </p>
    </>
  );
}

/* --------------------------------------------------------------- sorting */

function Sorting(): ReactNode {
  const START = [42, 8, 91, 27, 15, 63, 4, 55, 33, 78];
  const [bars, setBars] = useState(START);
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [running, setRunning] = useState(false);
  const [swaps, setSwaps] = useState(0);
  const [compares, setCompares] = useState(0);
  const stop = useRef(false);

  const reset = useCallback(() => {
    stop.current = true;
    setBars(START);
    setCursor(null);
    setSwaps(0);
    setCompares(0);
    setRunning(false);
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    stop.current = false;
    setRunning(true);
    const xs = [...bars];
    let sw = 0;
    let cp = 0;
    for (let i = 0; i < xs.length && !stop.current; i++) {
      for (let j = 0; j < xs.length - i - 1 && !stop.current; j++) {
        cp += 1;
        setCursor([j, j + 1]);
        setCompares(cp);
        if (xs[j] > xs[j + 1]) {
          [xs[j], xs[j + 1]] = [xs[j + 1], xs[j]];
          sw += 1;
          setSwaps(sw);
          setBars([...xs]);
        }
        await new Promise((r) => setTimeout(r, 42));
      }
    }
    setCursor(null);
    setRunning(false);
  }, [bars, running]);

  return (
    <>
      <div className={styles.bars} role="img" aria-label="Bar chart being sorted">
        {bars.map((v, i) => (
          <span
            key={`${i}-${v}`}
            className={
              cursor && (i === cursor[0] || i === cursor[1]) ? `${styles.bar} ${styles.hot}` : styles.bar
            }
            style={{ height: `${v}%` }}>
            <small>{v}</small>
          </span>
        ))}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.mini} onClick={run} disabled={running}>
          {running ? 'Sorting…' : 'Sort it'}
        </button>
        <button type="button" className={styles.mini} onClick={reset}>
          Reset
        </button>
      </div>

      <p className={styles.readout}>
        bubble sort · <b>{compares}</b> comparisons · <b>{swaps}</b> swaps. Ten items
        need up to {(10 * 9) / 2} comparisons — that is the n² in O(n²).
      </p>
    </>
  );
}

/* ---------------------------------------------------------------- search */

function Search({ binary }: { binary: boolean }): ReactNode {
  const DATA = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 97, 104];
  const [target, setTarget] = useState(38);
  const [step, setStep] = useState(0);

  const trace = useMemo(() => {
    const out: { lo: number; hi: number; mid: number }[] = [];
    if (binary) {
      let lo = 0;
      let hi = DATA.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        out.push({ lo, hi, mid });
        if (DATA[mid] === target) break;
        if (DATA[mid] < target) lo = mid + 1;
        else hi = mid - 1;
      }
    } else {
      for (let i = 0; i < DATA.length; i++) {
        out.push({ lo: 0, hi: DATA.length - 1, mid: i });
        if (DATA[i] === target) break;
      }
    }
    return out;
  }, [binary, target]);

  useEffect(() => setStep(0), [target, binary]);

  const now = trace[Math.min(step, trace.length - 1)];
  const found = DATA[now.mid] === target;

  return (
    <>
      <div className={styles.cells} role="img" aria-label="Array being searched">
        {DATA.map((v, i) => {
          const inRange = i >= now.lo && i <= now.hi;
          const isMid = i === now.mid;
          return (
            <span
              key={v}
              className={[
                styles.cell,
                inRange ? '' : styles.dim,
                isMid ? (found ? styles.hit : styles.probe) : '',
              ].join(' ')}>
              {v}
            </span>
          );
        })}
      </div>

      <div className={styles.controls}>
        <label>
          looking for <b>{target}</b>
          <input
            type="range" min="0" max={DATA.length - 1} step="1"
            value={DATA.indexOf(target)}
            onChange={(e) => setTarget(DATA[Number(e.target.value)])}
          />
        </label>
        <button
          type="button" className={styles.mini}
          onClick={() => setStep((s) => Math.min(s + 1, trace.length - 1))}
          disabled={step >= trace.length - 1}>
          Step
        </button>
        <button type="button" className={styles.mini} onClick={() => setStep(0)}>
          Reset
        </button>
      </div>

      <p className={styles.readout}>
        step <b>{step + 1}</b> of <b>{trace.length}</b> · checking index {now.mid} ={' '}
        {DATA[now.mid]}
        {found ? ' — found it.' : ''} {binary
          ? `Halving the range finds any of ${DATA.length} items in at most ${Math.ceil(Math.log2(DATA.length))} probes.`
          : `Checking one by one can take all ${DATA.length}.`}
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ shell */

const TITLES: Record<DiagramKind, [string, string]> = {
  regression: ['Fitting a line', 'Drag the slope and intercept and watch the error move.'],
  sorting: ['Sorting, one comparison at a time', 'Every swap is counted, so the cost is visible.'],
  search: ['Binary search', 'Each probe throws away half of what is left.'],
  binary: ['Linear vs binary search', 'The same array, two very different amounts of work.'],
};

export default function LiveDiagram({ kind }: { kind: DiagramKind }): ReactNode {
  const [title, blurb] = TITLES[kind];

  return (
    <figure className={styles.frame}>
      <figcaption className={styles.head}>
        <span className={styles.tag}>live</span>
        <b>{title}</b>
        <small>{blurb}</small>
      </figcaption>

      {kind === 'regression' && <Regression />}
      {kind === 'sorting' && <Sorting />}
      {kind === 'search' && <Search binary />}
      {kind === 'binary' && <Search binary={false} />}
    </figure>
  );
}
