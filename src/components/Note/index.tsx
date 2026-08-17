import { useEffect, type ReactNode } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '@site/src/css/notes.css';

/**
 * The repeating furniture of a topic page, so a page carries content and
 * nothing else.
 *
 * The stylesheet is imported right here rather than registered in
 * docusaurus.config.ts, so dropping these files into a project is the whole
 * installation — there is no configuration step to forget.
 */

/* ------------------------------------------------------ phone tables --- */

/**
 * Copies each table's column headings onto its cells as data-label. On a phone
 * the stylesheet turns every row into a small card and prints that label above
 * each value, so a five-column table stays readable at 380px instead of
 * scrolling sideways. On a wide screen the attribute goes unused.
 */
function labelTables(): void {
  document.querySelectorAll<HTMLTableElement>('.markdown table').forEach((table) => {
    const heads = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );
    if (heads.length === 0) return;

    table.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, i) => {
        /* A comparison table often has a blank first heading — the row's own
           name is label enough there, so leave that cell bare. */
        if (heads[i]) cell.setAttribute('data-label', heads[i]);
      });
    });
  });
}

/* --------------------------------------------------------------- intro --- */

export function Lede({ children }: { children: ReactNode }): ReactNode {
  /* Every topic page opens with a Lede, so this is where the page-wide
     touch-ups run once the content is on screen. */
  useEffect(() => {
    labelTables();
  }, []);

  return <p className="nx-lede">{children}</p>;
}

/* ------------------------------------------------------------- maths --- */

export function Eq({
  children,
  block = false,
}: {
  /** TeX source, e.g. "2^{10} = 1024". */
  children: string;
  /** Centre it on its own line instead of running it into the sentence. */
  block?: boolean;
}): ReactNode {
  const html = katex.renderToString(children, {
    displayMode: block,
    throwOnError: false,
    output: 'html',
  });

  return block ? (
    <div className="nx-eq" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/* ------------------------------------------------------------- callout --- */

export type CalloutKind = 'def' | 'tip' | 'note' | 'warn';

export function Callout({
  kind = 'note',
  title,
  children,
}: {
  /** def = the definition to memorise, tip = exam tip, note = aside, warn = trap */
  kind?: CalloutKind;
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={`nx-call nx-call--${kind}`}>
      <span className="nx-call__tag">{title}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ pros/cons --- */

export function ProsCons({
  pros,
  cons,
  prosTitle = 'Advantages',
  consTitle = 'Limitations',
}: {
  pros: string[];
  cons: string[];
  prosTitle?: string;
  consTitle?: string;
}): ReactNode {
  return (
    <div className="nx-grid">
      <div className="nx-card nx-card--pro">
        <h4>{prosTitle}</h4>
        <ul>
          {pros.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="nx-card nx-card--con">
        <h4>{consTitle}</h4>
        <ul>
          {cons.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- quiz --- */

export type QuizItem = { q: string; a: ReactNode };

export function Quiz({ items }: { items: QuizItem[] }): ReactNode {
  return (
    <div className="nx-quiz">
      {items.map((item, i) => (
        <details key={i}>
          <summary>
            {i + 1}. {item.q}
          </summary>
          <div className="nx-quiz__a">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ revision --- */

export function Revision({ points }: { points: ReactNode[] }): ReactNode {
  return (
    <ul className="nx-revision">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}
