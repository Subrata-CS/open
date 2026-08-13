import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/* ------------------------------------------------------------------ *
 * Panel 1 — Neural network forward pass + loss curve
 * ------------------------------------------------------------------ */

const LAYERS = [4, 6, 5, 3];
const LAYER_X = [56, 148, 240, 332];

function layerY(count: number, i: number): number {
  const gap = 30;
  const total = (count - 1) * gap;
  return 96 - total / 2 + i * gap;
}

function NeuralNet({ active }: { active: boolean }): ReactNode {
  const [epoch, setEpoch] = useState(1);
  const [loss, setLoss] = useState(0.914);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setEpoch((e) => (e >= 40 ? 1 : e + 1));
      setLoss((l) => (l <= 0.06 ? 0.914 : Number((l * 0.93).toFixed(3))));
    }, 420);
    return () => clearInterval(id);
  }, [active]);

  const edges = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; d: number }[] = [];
    for (let l = 0; l < LAYERS.length - 1; l++) {
      for (let a = 0; a < LAYERS[l]; a++) {
        for (let b = 0; b < LAYERS[l + 1]; b++) {
          out.push({
            x1: LAYER_X[l],
            y1: layerY(LAYERS[l], a),
            x2: LAYER_X[l + 1],
            y2: layerY(LAYERS[l + 1], b),
            d: l * 0.34 + ((a + b) % 5) * 0.07,
          });
        }
      }
    }
    return out;
  }, []);

  return (
    <div className={styles.panelBody}>
      <svg viewBox="0 0 400 232" className={styles.svg} role="img" aria-label="Neural network training">
        <g>
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              className={styles.edge}
              style={{ animationDelay: `${e.d}s` }}
            />
          ))}
        </g>
        {LAYERS.map((count, l) =>
          Array.from({ length: count }).map((_, i) => (
            <circle
              key={`${l}-${i}`}
              cx={LAYER_X[l]}
              cy={layerY(count, i)}
              r={7}
              className={l === LAYERS.length - 1 ? styles.nodeOut : styles.node}
              style={{ animationDelay: `${l * 0.34 + i * 0.06}s` }}
            />
          )),
        )}

        <text x={56} y={206} className={styles.axis}>input</text>
        <text x={196} y={206} className={styles.axis} textAnchor="middle">hidden layers</text>
        <text x={344} y={206} className={styles.axis} textAnchor="end">output</text>

        <path
          d="M 40 224 C 90 224 96 214 130 212 C 180 209 210 206 250 204 C 300 202 330 201 360 200"
          className={styles.lossCurve}
        />
      </svg>

      <div className={styles.readout}>
        <span><b>epoch</b> {String(epoch).padStart(2, '0')}/40</span>
        <span><b>loss</b> {loss.toFixed(3)}</span>
        <span className={styles.live}>backprop</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Panel 2 — CPU instruction pipeline
 * ------------------------------------------------------------------ */

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];
const INSTRUCTIONS = ['LOAD', 'MUL', 'ADD', 'STORE'];

function CpuPipeline({ active }: { active: boolean }): ReactNode {
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setCycle((c) => (c >= 99 ? 1 : c + 1)), 700);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className={styles.panelBody}>
      <div className={styles.stageRow}>
        {STAGES.map((s) => (
          <div key={s} className={styles.stage}>
            <span className={styles.stageName}>{s}</span>
          </div>
        ))}
      </div>

      <div className={styles.track}>
        {INSTRUCTIONS.map((ins, i) => (
          <div
            key={ins}
            className={styles.chip}
            style={{ animationDelay: `${i * 0.7}s`, top: `${i * 30}px` }}>
            {ins}
          </div>
        ))}
      </div>

      <div className={styles.readout}>
        <span><b>cycle</b> {String(cycle).padStart(2, '0')}</span>
        <span><b>IPC</b> 0.98</span>
        <span className={styles.live}>pipelined</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Panel 3 — Live code
 * ------------------------------------------------------------------ */

type Line = { t: string; c?: 'kw' | 'fn' | 'str' | 'num' | 'com' | 'out' };

const CODE: Line[] = [
  { t: 'import torch', c: 'kw' },
  { t: 'from model import Transformer', c: 'kw' },
  { t: '' },
  { t: '# 578 topics, one syllabus', c: 'com' },
  { t: 'model = Transformer(layers=12)', c: 'fn' },
  { t: 'opt = torch.optim.AdamW(model.parameters())', c: 'fn' },
  { t: '' },
  { t: 'for batch in loader:', c: 'kw' },
  { t: '    loss = model(batch).loss', c: 'fn' },
  { t: '    loss.backward(); opt.step()', c: 'fn' },
  { t: '' },
  { t: '>>> step 400 · loss 0.061 · acc 0.97', c: 'out' },
];

function LiveCode({ active }: { active: boolean }): ReactNode {
  const [shown, setShown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    timer.current = setInterval(() => {
      setShown((n) => (n >= CODE.length ? 0 : n + 1));
    }, 380);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [active]);

  return (
    <div className={styles.panelBody}>
      <div className={styles.code}>
        {CODE.slice(0, shown).map((line, i) => (
          <div key={i} className={styles.codeLine}>
            <span className={styles.gutter}>{String(i + 1).padStart(2, '0')}</span>
            <span className={line.c ? styles[line.c] : undefined}>{line.t || '\u00A0'}</span>
          </div>
        ))}
        {shown < CODE.length && <span className={styles.caret} />}
      </div>

      <div className={styles.readout}>
        <span><b>python</b> train.py</span>
        <span><b>device</b> cuda:0</span>
        <span className={styles.live}>running</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */

const TABS = [
  { key: 'nn', label: 'Deep Learning', file: 'train.py' },
  { key: 'cpu', label: 'CPU Pipeline', file: 'pipeline.v' },
  { key: 'code', label: 'Live Run', file: 'output.log' },
];

export default function HeroVisual(): ReactNode {
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTab((t) => (t + 1) % TABS.length), 7000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className={styles.window}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className={styles.titlebar}>
        <span className={styles.dots}>
          <i /><i /><i />
        </span>
        <span className={styles.filename}>{TABS[tab].file}</span>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            className={i === tab ? styles.tabActive : styles.tab}
            onClick={() => setTab(i)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.stage2}>
        {tab === 0 && <NeuralNet active={tab === 0} />}
        {tab === 1 && <CpuPipeline active={tab === 1} />}
        {tab === 2 && <LiveCode active={tab === 2} />}
      </div>
    </div>
  );
}
