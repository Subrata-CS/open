import type { ReactNode } from 'react';
import Fig from '../Fig';

/**
 * A diagram written as data instead of as SVG.
 *
 * A topic page says what the blocks are; this works out the coordinates, and
 * builds two layouts — wide for desktop, tall for phones — so every diagram on
 * the site is drawn to the same proportions, spacing and type sizes.
 *
 *   <Diagram type="chain" label="Fig 1" title="The IPO cycle"
 *     items={[{ title: 'INPUT', lines: ['keyboard, mouse'] }, ...]} />
 *
 * Three shapes cover almost every topic:
 *
 *   chain    boxes in order, arrows between them (a process, a pipeline)
 *   tree     one root splitting into branches, each with a list (a taxonomy)
 *   pyramid  stacked tiers, widest at the bottom (a hierarchy)
 *
 * Anything with a shape of its own — the CPU block diagram, a circuit — is
 * still written by hand and passed to <Fig> directly.
 */

export type DiagramItem = {
  /** The bold line inside the box. */
  title: string;
  /** Up to two short lines under it. */
  lines?: string[];
  /** Tint this box, to mark the step that matters most. */
  highlight?: boolean;
};

export type DiagramBranch = {
  title: string;
  subtitle?: string;
  items: string[];
};

export type DiagramProps = {
  type: 'chain' | 'tree' | 'pyramid';
  label?: string;
  title?: string;
  caption?: string;
  animated?: boolean;
  /** Tiny caps label in the corner of the drawing. */
  eyebrow?: string;
  /** Sentence drawn at the foot of the drawing itself. */
  footnote?: string;

  /** chain and pyramid */
  items?: DiagramItem[];
  /** chain only: a box hanging below, joined both ways (storage, feedback). */
  aside?: DiagramItem & { attachTo?: number };

  /** tree only */
  root?: string;
  branches?: DiagramBranch[];
};

/* ---------------------------------------------------------------- parts --- */

const arrowDefs = (id: string, control = false) => (
  <defs>
    <marker id={id} markerWidth="10" markerHeight="10" refX="9" refY="3.2" orient="auto">
      <path
        d="M0,0 L9,3.2 L0,6.4 z"
        className={control ? 'nx-head nx-head--ctrl' : 'nx-head'}
      />
    </marker>
  </defs>
);

const box = (
  key: string,
  x: number,
  y: number,
  w: number,
  h: number,
  item: DiagramItem,
  big: boolean,
) => {
  const cx = x + w / 2;
  const titleClass = big ? 'nx-t nx-t--m' : 'nx-t';
  const lineClass = big ? 'nx-s nx-s--m' : 'nx-s';
  const titleY = y + (big ? 34 : 30);
  const firstLine = y + (big ? 60 : 54);
  const step = big ? 24 : 22;

  return (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        className={item.highlight ? 'nx-box nx-box--mem' : 'nx-box'}
      />
      <text x={cx} y={titleY} textAnchor="middle" className={titleClass}>
        {item.title}
      </text>
      {(item.lines ?? []).map((line, i) => (
        <text
          key={i}
          x={cx}
          y={firstLine + i * step}
          textAnchor="middle"
          className={lineClass}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const boxHeight = (item: DiagramItem, big: boolean) => {
  const lines = item.lines?.length ?? 0;
  return (big ? 52 : 44) + lines * (big ? 24 : 22);
};

/* ---------------------------------------------------------------- chain --- */

function chainWide(p: DiagramProps, marker: string) {
  const items = p.items ?? [];
  const W = 880;
  const pad = 30;
  const gap = 58;
  const n = Math.max(items.length, 1);
  const w = (W - pad * 2 - gap * (n - 1)) / n;
  const top = p.eyebrow ? 74 : 40;
  const h = Math.max(...items.map((i) => boxHeight(i, false)), 80);
  const midY = top + h / 2;

  const aside = p.aside;
  const asideH = aside ? boxHeight(aside, false) : 0;
  const asideTop = top + h + 74;
  const attach = aside ? Math.min(aside.attachTo ?? Math.floor(n / 2), n - 1) : 0;
  const attachX = pad + attach * (w + gap) + w / 2;
  const asideW = Math.min(w + 60, 320);
  const asideX = attachX - asideW / 2;

  const footY = (aside ? asideTop + asideH : top + h) + 40;
  const H = footY + (p.footnote ? 14 : -18);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title ?? 'Diagram'}>
      {arrowDefs(marker)}
      {p.eyebrow && (
        <text x={pad} y={44} className="nx-eyebrow">
          {p.eyebrow}
        </text>
      )}

      {items.map((item, i) => box(`b${i}`, pad + i * (w + gap), top, w, h, item, false))}

      {items.slice(1).map((_, i) => {
        const x1 = pad + i * (w + gap) + w;
        return (
          <line
            key={`a${i}`}
            x1={x1}
            y1={midY}
            x2={x1 + gap - 6}
            y2={midY}
            className="nx-flow"
            markerEnd={`url(#${marker})`}
          />
        );
      })}

      {aside && (
        <>
          {box('aside', asideX, asideTop, asideW, asideH, aside, false)}
          <line
            x1={attachX - 22}
            y1={top + h}
            x2={attachX - 22}
            y2={asideTop - 6}
            className="nx-flow"
            markerEnd={`url(#${marker})`}
          />
          <line
            x1={attachX + 22}
            y1={asideTop}
            x2={attachX + 22}
            y2={top + h + 6}
            className="nx-flow"
            markerEnd={`url(#${marker})`}
          />
        </>
      )}

      {p.footnote && (
        <text x={W / 2} y={footY} textAnchor="middle" className="nx-s">
          {p.footnote}
        </text>
      )}
    </svg>
  );
}

function chainNarrow(p: DiagramProps, marker: string) {
  const items = p.items ?? [];
  const W = 420;
  const x = 50;
  const w = 340;
  const gap = 36;
  let y = p.eyebrow ? 42 : 24;

  const nodes: ReactNode[] = [];
  const tops: number[] = [];

  items.forEach((item, i) => {
    const h = boxHeight(item, true);
    tops.push(y);
    nodes.push(box(`b${i}`, x, y, w, h, item, true));
    if (i < items.length - 1) {
      nodes.push(
        <line
          key={`a${i}`}
          x1={W / 2}
          y1={y + h}
          x2={W / 2}
          y2={y + h + gap - 6}
          className="nx-flow"
          markerEnd={`url(#${marker})`}
        />,
      );
    }
    y += h + gap;
  });

  const lastBottom = y - gap;
  const aside = p.aside;
  let H = lastBottom + 24;

  if (aside) {
    const attach = Math.min(aside.attachTo ?? Math.floor(items.length / 2), items.length - 1);
    const attachTop = tops[attach] ?? 0;
    const attachH = boxHeight(items[attach] ?? { title: '' }, true);
    const asideY = lastBottom + 58;
    const asideH = boxHeight(aside, true);

    nodes.push(box('aside', x, asideY, w, asideH, aside, true));
    nodes.push(
      <polyline
        key="down"
        points={`${x},${attachTop + 36} 26,${attachTop + 36} 26,${asideY + 30} ${x - 8},${asideY + 30}`}
        className="nx-flow"
        markerEnd={`url(#${marker})`}
      />,
    );
    nodes.push(
      <polyline
        key="up"
        points={`${x},${asideY + asideH - 24} 12,${asideY + asideH - 24} 12,${attachTop + attachH - 24} ${x - 8},${attachTop + attachH - 24}`}
        className="nx-flow"
        markerEnd={`url(#${marker})`}
      />,
    );
    H = asideY + asideH + 24;
  }

  if (p.footnote) H += 28;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title ?? 'Diagram'}>
      {arrowDefs(marker)}
      {p.eyebrow && (
        <text x={14} y={24} className="nx-eyebrow">
          {p.eyebrow}
        </text>
      )}
      {nodes}
      {p.footnote && (
        <text x={W / 2} y={H - 10} textAnchor="middle" className="nx-s nx-s--m">
          {p.footnote}
        </text>
      )}
    </svg>
  );
}

/* ----------------------------------------------------------------- tree --- */

function treeWide(p: DiagramProps, marker: string) {
  const branches = p.branches ?? [];
  const W = 880;
  const pad = 30;
  const gap = 40;
  const n = Math.max(branches.length, 1);
  const colW = (W - pad * 2 - gap * (n - 1)) / n;
  const headY = 130;
  const headH = 56;
  const itemH = 44;
  const itemGap = 8;
  const firstItem = headY + headH + 28;
  const rows = Math.max(...branches.map((b) => b.items.length), 1);
  const H = firstItem + rows * (itemH + itemGap) + 20;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title ?? 'Diagram'}>
      {arrowDefs(marker)}

      <rect x={W / 2 - 110} y={16} width={220} height={48} rx={12} className="nx-box nx-box--mem" />
      <text x={W / 2} y={46} textAnchor="middle" className="nx-t nx-t--sm">
        {p.root}
      </text>

      {branches.map((b, i) => {
        const x = pad + i * (colW + gap);
        const cx = x + colW / 2;
        const railX = x + 16;
        const lastMid = firstItem + (b.items.length - 1) * (itemH + itemGap) + itemH / 2;

        return (
          <g key={`br${i}`}>
            <polyline
              points={`${W / 2},64 ${W / 2},98 ${cx},98 ${cx},${headY - 6}`}
              className="nx-flow"
              markerEnd={`url(#${marker})`}
            />
            <rect x={x} y={headY} width={colW} height={headH} rx={12} className="nx-box" />
            <text x={cx} y={headY + 26} textAnchor="middle" className="nx-t nx-t--sm">
              {b.title}
            </text>
            {b.subtitle && (
              <text x={cx} y={headY + 45} textAnchor="middle" className="nx-s">
                {b.subtitle}
              </text>
            )}

            <polyline
              points={`${cx},${headY + headH} ${cx},${headY + headH + 12} ${railX},${headY + headH + 12} ${railX},${lastMid}`}
              className="nx-flow"
            />

            {b.items.map((label, j) => {
              const y = firstItem + j * (itemH + itemGap);
              return (
                <g key={`i${j}`}>
                  <line
                    x1={railX}
                    y1={y + itemH / 2}
                    x2={railX + 8}
                    y2={y + itemH / 2}
                    className="nx-flow"
                    markerEnd={`url(#${marker})`}
                  />
                  <rect
                    x={railX + 14}
                    y={y}
                    width={colW - 14 - 16}
                    height={itemH}
                    rx={10}
                    className="nx-box nx-box--alt"
                  />
                  <text
                    x={railX + 14 + (colW - 30) / 2}
                    y={y + 27}
                    textAnchor="middle"
                    className="nx-s"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function treeNarrow(p: DiagramProps, marker: string) {
  const branches = p.branches ?? [];
  const W = 420;
  const headH = 46;
  const itemH = 44;
  const itemGap = 10;
  const nodes: ReactNode[] = [];
  const stubs: number[] = [];

  let y = 88;
  branches.forEach((b, i) => {
    const headTop = y;
    stubs.push(headTop + headH / 2);
    nodes.push(
      <g key={`h${i}`}>
        <rect x={60} y={headTop} width={340} height={headH} rx={12} className="nx-box" />
        <text x={230} y={headTop + 20} textAnchor="middle" className="nx-t nx-t--sm">
          {b.title}
        </text>
        {b.subtitle && (
          <text x={230} y={headTop + 38} textAnchor="middle" className="nx-s">
            {b.subtitle}
          </text>
        )}
      </g>,
    );

    const first = headTop + headH + 16;
    const lastMid = first + (b.items.length - 1) * (itemH + itemGap) + itemH / 2;
    nodes.push(
      <polyline
        key={`rail${i}`}
        points={`230,${headTop + headH} 230,${headTop + headH + 8} 64,${headTop + headH + 8} 64,${lastMid}`}
        className="nx-flow"
      />,
    );

    b.items.forEach((label, j) => {
      const iy = first + j * (itemH + itemGap);
      nodes.push(
        <g key={`n${i}-${j}`}>
          <line
            x1={64}
            y1={iy + itemH / 2}
            x2={72}
            y2={iy + itemH / 2}
            className="nx-flow"
            markerEnd={`url(#${marker})`}
          />
          <rect x={80} y={iy} width={320} height={itemH} rx={10} className="nx-box nx-box--alt" />
          <text x={240} y={iy + 27} textAnchor="middle" className="nx-s nx-s--m">
            {label}
          </text>
        </g>,
      );
    });

    y = first + b.items.length * (itemH + itemGap) + 34;
  });

  const H = y;
  const trunkEnd = stubs[stubs.length - 1] ?? 100;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title ?? 'Diagram'}>
      {arrowDefs(marker)}
      <rect x={90} y={16} width={240} height={48} rx={12} className="nx-box nx-box--mem" />
      <text x={210} y={46} textAnchor="middle" className="nx-t nx-t--sm">
        {p.root}
      </text>
      <polyline points={`210,64 210,80 24,80 24,${trunkEnd}`} className="nx-flow" />
      {stubs.map((sy, i) => (
        <line
          key={`s${i}`}
          x1={24}
          y1={sy}
          x2={52}
          y2={sy}
          className="nx-flow"
          markerEnd={`url(#${marker})`}
        />
      ))}
      {nodes}
    </svg>
  );
}

/* -------------------------------------------------------------- pyramid --- */

function pyramid(p: DiagramProps, W: number, topW: number, botW: number, tierH: number, big: boolean) {
  const items = p.items ?? [];
  const n = Math.max(items.length, 1);
  const top = p.eyebrow ? 44 : 24;
  const cx = W / 2;
  const H = top + n * tierH + (p.footnote ? 46 : 20);
  const widthAt = (i: number) => topW + ((botW - topW) * i) / n;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={p.title ?? 'Diagram'}>
      {p.eyebrow && (
        <text x={cx} y={26} textAnchor="middle" className="nx-eyebrow">
          {p.eyebrow}
        </text>
      )}
      {items.map((item, i) => {
        const yTop = top + i * tierH;
        const yBot = yTop + tierH;
        const wT = widthAt(i);
        const wB = widthAt(i + 1);
        const hasLines = (item.lines?.length ?? 0) > 0;
        return (
          <g key={`t${i}`}>
            <polygon
              points={`${cx - wT / 2},${yTop} ${cx + wT / 2},${yTop} ${cx + wB / 2},${yBot} ${cx - wB / 2},${yBot}`}
              className={item.highlight ? 'nx-box nx-box--mem' : 'nx-box'}
            />
            <text
              x={cx}
              y={yTop + tierH / 2 + (hasLines ? -4 : 6)}
              textAnchor="middle"
              className="nx-t nx-t--sm"
            >
              {item.title}
            </text>
            {(item.lines ?? []).map((line, j) => (
              <text
                key={j}
                x={cx}
                y={yTop + tierH / 2 + 20 + j * 20}
                textAnchor="middle"
                className={big ? 'nx-s nx-s--m' : 'nx-s'}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {p.footnote && (
        <text x={cx} y={H - 14} textAnchor="middle" className={big ? 'nx-s nx-s--m' : 'nx-s'}>
          {p.footnote}
        </text>
      )}
    </svg>
  );
}

/* --------------------------------------------------------------- export --- */

export default function Diagram(props: DiagramProps): ReactNode {
  const seed = (props.label ?? props.title ?? 'fig').replace(/\W+/g, '');
  const mW = `dgW${seed}`;
  const mN = `dgN${seed}`;

  let wide: ReactNode;
  let narrow: ReactNode;

  if (props.type === 'chain') {
    wide = chainWide(props, mW);
    narrow = chainNarrow(props, mN);
  } else if (props.type === 'tree') {
    wide = treeWide(props, mW);
    narrow = treeNarrow(props, mN);
  } else {
    wide = pyramid(props, 880, 160, 560, 74, false);
    narrow = pyramid(props, 420, 120, 360, 108, true);
  }

  return (
    <Fig
      label={props.label}
      title={props.title}
      caption={props.caption}
      animated={props.animated ?? props.type === 'chain'}
      narrow={narrow}
    >
      {wide}
    </Fig>
  );
}
