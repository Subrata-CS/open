import { useEffect, useState, type ReactNode } from 'react';
import Viz, { type VizKind } from '@site/src/components/Viz';
import styles from './styles.module.css';

type Metric = { label: string; from: number; to: number; step: number; digits: number };

type Panel = {
  key: string;
  label: string;
  file: string;
  kind: VizKind;
  status: string;
  metrics: Metric[];
};

const PANELS: Panel[] = [
  {
    key: 'dl',
    label: 'Deep Learning',
    file: 'train.py',
    kind: 'network',
    status: 'backprop',
    metrics: [
      { label: 'epoch', from: 1, to: 40, step: 1, digits: 0 },
      { label: 'loss', from: 0.914, to: 0.061, step: -0.031, digits: 3 },
    ],
  },
  {
    key: 'ml',
    label: 'Machine Learning',
    file: 'fit.py',
    kind: 'scatter',
    status: 'converged',
    metrics: [
      { label: 'R²', from: 0.62, to: 0.958, step: 0.021, digits: 3 },
      { label: 'rmse', from: 3.4, to: 1.42, step: -0.12, digits: 2 },
    ],
  },
  {
    key: 'cpu',
    label: 'CPU Pipeline',
    file: 'pipeline.v',
    kind: 'cpu',
    status: 'pipelined',
    metrics: [
      { label: 'cycle', from: 1, to: 64, step: 1, digits: 0 },
      { label: 'IPC', from: 0.71, to: 0.98, step: 0.02, digits: 2 },
    ],
  },
  {
    key: 'c',
    label: 'C / C++',
    file: 'main.c',
    kind: 'code',
    status: 'compiled',
    metrics: [
      { label: 'lines', from: 1, to: 96, step: 3, digits: 0 },
      { label: 'warnings', from: 0, to: 0, step: 0, digits: 0 },
    ],
  },
  {
    key: 'ai',
    label: 'AI Search',
    file: 'search.py',
    kind: 'graph',
    status: 'expanding',
    metrics: [
      { label: 'nodes', from: 1, to: 128, step: 4, digits: 0 },
      { label: 'depth', from: 1, to: 7, step: 1, digits: 0 },
    ],
  },
  {
    key: 'nlp',
    label: 'NLP',
    file: 'tokenize.py',
    kind: 'tokens',
    status: 'encoding',
    metrics: [
      { label: 'tokens', from: 4, to: 512, step: 12, digits: 0 },
      { label: 'vocab', from: 32000, to: 32000, step: 0, digits: 0 },
    ],
  },
  {
    key: 'llm',
    label: 'LLM',
    file: 'attention.py',
    kind: 'attention',
    status: 'decoding',
    metrics: [
      { label: 'heads', from: 12, to: 12, step: 0, digits: 0 },
      { label: 'ctx', from: 8, to: 2048, step: 64, digits: 0 },
    ],
  },
  {
    key: 'chain',
    label: 'Blockchain',
    file: 'chain.sol',
    kind: 'crypto',
    status: 'confirmed',
    metrics: [
      { label: 'block', from: 1, to: 240, step: 1, digits: 0 },
      { label: 'nonce', from: 1, to: 9999, step: 137, digits: 0 },
    ],
  },
  {
    key: 'res',
    label: 'Research',
    file: 'paper.tex',
    kind: 'research',
    status: 'in review',
    metrics: [
      { label: 'runs', from: 1, to: 32, step: 1, digits: 0 },
      { label: 'p-value', from: 0.31, to: 0.01, step: -0.02, digits: 2 },
    ],
  },
];

/** Small counters that tick while a panel is on screen. */
function useMetrics(metrics: Metric[], active: boolean): number[] {
  const [values, setValues] = useState(() => metrics.map((m) => m.from));

  useEffect(() => {
    setValues(metrics.map((m) => m.from));
    if (!active) return;
    const id = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const m = metrics[i];
          if (m.step === 0) return v;
          const next = v + m.step;
          const done = m.step > 0 ? next >= m.to : next <= m.to;
          return done ? m.from : Number(next.toFixed(4));
        }),
      );
    }, 480);
    return () => clearInterval(id);
  }, [metrics, active]);

  return values;
}

function Panel({ panel, active }: { panel: Panel; active: boolean }): ReactNode {
  const values = useMetrics(panel.metrics, active);

  return (
    <div className={styles.panelBody}>
      <div className={styles.canvas}>
        <Viz kind={panel.kind} />
      </div>
      <div className={styles.readout}>
        {panel.metrics.map((m, i) => (
          <span key={m.label}>
            <b>{m.label}</b>
            {m.digits === 0 ? Math.round(values[i]).toLocaleString() : values[i].toFixed(m.digits)}
          </span>
        ))}
        <span className={styles.live}>{panel.status}</span>
      </div>
    </div>
  );
}

export default function HeroVisual(): ReactNode {
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setAt((t) => (t + 1) % PANELS.length), 6500);
    return () => clearInterval(id);
  }, [paused]);

  const panel = PANELS[at];

  return (
    <div
      className={styles.window}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className={styles.titlebar}>
        <span className={styles.dots}><i /><i /><i /></span>
        <span className={styles.filename}>{panel.file}</span>
      </div>

      <div className={styles.tabs} role="tablist">
        {PANELS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={i === at}
            className={i === at ? styles.tabActive : styles.tab}
            onClick={() => setAt(i)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.stage} key={panel.key}>
        <Panel panel={panel} active />
      </div>
    </div>
  );
}
