import { useMemo, type ReactNode } from 'react';
import styles from './styles.module.css';

export type VizKind =
  | 'network'
  | 'cpu'
  | 'code'
  | 'graph'
  | 'matrix'
  | 'scatter'
  | 'packets'
  | 'database'
  | 'pipeline'
  | 'crypto'
  | 'browser'
  | 'quantum';

const VB = '0 0 400 240';

/* ---------------- network: neural net forward pass ---------------- */

const LAYERS = [4, 6, 5, 3];
const LAYER_X = [56, 148, 240, 332];

function nodeY(count: number, i: number): number {
  const gap = 30;
  return 110 - ((count - 1) * gap) / 2 + i * gap;
}

function Network(): ReactNode {
  const edges = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; d: number }[] = [];
    for (let l = 0; l < LAYERS.length - 1; l++) {
      for (let a = 0; a < LAYERS[l]; a++) {
        for (let b = 0; b < LAYERS[l + 1]; b++) {
          out.push({
            x1: LAYER_X[l],
            y1: nodeY(LAYERS[l], a),
            x2: LAYER_X[l + 1],
            y2: nodeY(LAYERS[l + 1], b),
            d: l * 0.34 + ((a + b) % 5) * 0.07,
          });
        }
      }
    }
    return out;
  }, []);

  return (
    <svg viewBox={VB} className={styles.svg}>
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
      {LAYERS.map((count, l) =>
        Array.from({ length: count }).map((_, i) => (
          <circle
            key={`${l}-${i}`}
            cx={LAYER_X[l]}
            cy={nodeY(count, i)}
            r={7}
            className={l === LAYERS.length - 1 ? styles.nodeAlt : styles.node}
            style={{ animationDelay: `${l * 0.34 + i * 0.06}s` }}
          />
        )),
      )}
      <path
        d="M 40 226 C 96 226 100 214 140 210 C 190 205 220 202 260 200 C 306 198 336 197 364 196"
        className={styles.curve}
      />
    </svg>
  );
}

/* ---------------- cpu: instruction pipeline ---------------- */

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];

function Cpu(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {STAGES.map((s, i) => (
        <g key={s}>
          <rect x={16 + i * 76} y={40} width={64} height={160} rx={10} className={styles.slot} />
          <text x={48 + i * 76} y={30} className={styles.label} textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={16}
          y={58 + i * 36}
          width={64}
          height={24}
          rx={7}
          className={styles.marchChip}
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
      <line x1={16} y1={218} x2={384} y2={218} className={styles.clock} />
    </svg>
  );
}

/* ---------------- code: streaming lines ---------------- */

const WIDTHS = [140, 210, 90, 260, 180, 120, 230, 160];

function Code(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {WIDTHS.map((w, i) => (
        <g key={i}>
          <rect x={24} y={26 + i * 26} width={12} height={9} rx={3} className={styles.gutterBar} />
          <rect
            x={48}
            y={24 + i * 26}
            width={w}
            height={12}
            rx={5}
            className={styles.codeBar}
            style={{ animationDelay: `${i * 0.28}s` }}
          />
        </g>
      ))}
      <rect x={48} y={232} width={9} height={2} className={styles.caretBar} />
    </svg>
  );
}

/* ---------------- graph: BFS traversal ---------------- */

const GNODES = [
  [200, 40], [110, 100], [290, 100], [60, 175], [160, 175], [250, 175], [340, 175],
];
const GEDGES = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
];

function Graph(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {GEDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={GNODES[a][0]}
          y1={GNODES[a][1]}
          x2={GNODES[b][0]}
          y2={GNODES[b][1]}
          className={styles.edgeSolid}
          style={{ animationDelay: `${0.35 + i * 0.22}s` }}
        />
      ))}
      {GNODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={13}
          className={styles.node}
          style={{ animationDelay: `${i * 0.28}s` }}
        />
      ))}
    </svg>
  );
}

/* ---------------- matrix: multiplication sweep ---------------- */

function Matrix(): ReactNode {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push({ r, c });
    }
  }
  return (
    <svg viewBox={VB} className={styles.svg}>
      {cells.map(({ r, c }) => (
        <rect
          key={`a${r}${c}`}
          x={24 + c * 30}
          y={62 + r * 30}
          width={24}
          height={24}
          rx={5}
          className={styles.cell}
          style={{ animationDelay: `${r * 0.16}s` }}
        />
      ))}
      <text x={168} y={128} className={styles.glyph}>×</text>
      {cells.map(({ r, c }) => (
        <rect
          key={`b${r}${c}`}
          x={190 + c * 30}
          y={62 + r * 30}
          width={24}
          height={24}
          rx={5}
          className={styles.cell}
          style={{ animationDelay: `${c * 0.16 + 0.4}s` }}
        />
      ))}
      <text x={326} y={128} className={styles.glyph}>=</text>
      {[0, 1, 2, 3].map((r) => (
        <rect
          key={`c${r}`}
          x={352}
          y={62 + r * 30}
          width={24}
          height={24}
          rx={5}
          className={styles.cellOut}
          style={{ animationDelay: `${r * 0.16 + 0.8}s` }}
        />
      ))}
    </svg>
  );
}

/* ---------------- scatter: regression fit ---------------- */

const POINTS = [
  [50, 190], [78, 176], [96, 182], [120, 160], [142, 152], [166, 158],
  [188, 138], [212, 128], [236, 132], [258, 112], [282, 104], [306, 96],
  [328, 84], [352, 76],
];

function Scatter(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      <line x1={36} y1={210} x2={376} y2={210} className={styles.axisLine} />
      <line x1={36} y1={210} x2={36} y2={40} className={styles.axisLine} />
      {POINTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          className={styles.point}
          style={{ animationDelay: `${i * 0.09}s` }}
        />
      ))}
      <line x1={44} y1={196} x2={368} y2={70} className={styles.fitLine} />
    </svg>
  );
}

/* ---------------- packets: routing ---------------- */

function Packets(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {[70, 120, 170].map((y, row) => (
        <g key={y}>
          <line x1={40} y1={y} x2={360} y2={y} className={styles.wire} />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={40}
              y={y - 7}
              width={26}
              height={14}
              rx={4}
              className={styles.packet}
              style={{ animationDelay: `${row * 0.5 + i * 1.1}s` }}
            />
          ))}
        </g>
      ))}
      {[40, 200, 360].map((x) => (
        <circle key={x} cx={x} cy={210} r={10} className={styles.node} />
      ))}
    </svg>
  );
}

/* ---------------- database: query scan ---------------- */

function Database(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      <ellipse cx={100} cy={54} rx={58} ry={18} className={styles.disk} />
      <path d="M42 54 v92 a58 18 0 0 0 116 0 V54" className={styles.diskBody} />
      <ellipse cx={100} cy={100} rx={58} ry={18} className={styles.diskLine} />
      <ellipse cx={100} cy={146} rx={58} ry={18} className={styles.diskLine} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={210}
          y={48 + i * 32}
          width={160}
          height={20}
          rx={6}
          className={styles.row}
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </svg>
  );
}

/* ---------------- pipeline: CI/CD stages ---------------- */

const PIPE = ['build', 'test', 'scan', 'ship'];

function Pipeline(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      <line x1={40} y1={120} x2={360} y2={120} className={styles.wire} />
      {PIPE.map((p, i) => (
        <g key={p}>
          <circle
            cx={56 + i * 96}
            cy={120}
            r={22}
            className={styles.stageDot}
            style={{ animationDelay: `${i * 0.6}s` }}
          />
          <text x={56 + i * 96} y={172} className={styles.label} textAnchor="middle">
            {p}
          </text>
        </g>
      ))}
      <circle cx={56} cy={120} r={7} className={styles.runner} />
    </svg>
  );
}

/* ---------------- crypto: block chain / hashing ---------------- */

function Crypto(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {i < 3 && (
            <line
              x1={70 + i * 92}
              y1={120}
              x2={110 + i * 92}
              y2={120}
              className={styles.edgeSolid}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          )}
          <rect
            x={18 + i * 92}
            y={78}
            width={64}
            height={84}
            rx={10}
            className={styles.block}
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          {[0, 1, 2].map((r) => (
            <rect
              key={r}
              x={28 + i * 92}
              y={94 + r * 20}
              width={44}
              height={8}
              rx={3}
              className={styles.hashBar}
              style={{ animationDelay: `${i * 0.5 + r * 0.18}s` }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- browser: page render ---------------- */

function Browser(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      <rect x={30} y={30} width={340} height={180} rx={12} className={styles.frame} />
      <line x1={30} y1={62} x2={370} y2={62} className={styles.wire} />
      {[46, 62, 78].map((cx) => (
        <circle key={cx} cx={cx} cy={46} r={4} className={styles.dot} />
      ))}
      <rect x={46} y={78} width={130} height={54} rx={8} className={styles.blockFill} style={{ animationDelay: '0.1s' }} />
      <rect x={190} y={78} width={160} height={16} rx={5} className={styles.codeBar} style={{ animationDelay: '0.3s' }} />
      <rect x={190} y={104} width={120} height={16} rx={5} className={styles.codeBar} style={{ animationDelay: '0.45s' }} />
      <rect x={46} y={148} width={304} height={16} rx={5} className={styles.codeBar} style={{ animationDelay: '0.6s' }} />
      <rect x={46} y={174} width={220} height={16} rx={5} className={styles.codeBar} style={{ animationDelay: '0.75s' }} />
    </svg>
  );
}

/* ---------------- quantum: bloch orbits ---------------- */

function Quantum(): ReactNode {
  return (
    <svg viewBox={VB} className={styles.svg}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${110 + i * 90} 120)`}>
          <circle r={44} className={styles.orbitRing} />
          <ellipse rx={44} ry={16} className={styles.orbit} style={{ animationDelay: `${i * 0.4}s` }} />
          <ellipse
            rx={16}
            ry={44}
            className={styles.orbit}
            style={{ animationDelay: `${i * 0.4 + 0.2}s` }}
          />
          <circle r={6} className={styles.nodeAlt} style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
    </svg>
  );
}

const MAP: Record<VizKind, () => ReactNode> = {
  network: Network,
  cpu: Cpu,
  code: Code,
  graph: Graph,
  matrix: Matrix,
  scatter: Scatter,
  packets: Packets,
  database: Database,
  pipeline: Pipeline,
  crypto: Crypto,
  browser: Browser,
  quantum: Quantum,
};

export default function Viz({ kind }: { kind: VizKind }): ReactNode {
  const Component = MAP[kind] ?? Network;
  return <Component />;
}
