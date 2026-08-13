import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { LANGS, langById, runCode, type LangId } from '@site/src/lib/runners';
import styles from './styles.module.css';

/* ------------------------------------------------------------------ */

export type LessonCell = {
  /** Heading shown above the snippet. */
  title?: string;
  /** Short explanation shown under the heading. */
  note?: string;
  lang: LangId;
  code: string;
  /** Expected output you wrote yourself — shown as-is. */
  output?: string;
};

type Cell = {
  id: string;
  lang: LangId;
  code: string;
  output: string;
  ok: boolean;
  busy: boolean;
  status: string;
};

let counter = 0;
const nextId = () => `cell-${++counter}-${Date.now().toString(36)}`;

function makeCell(lang: LangId, code?: string): Cell {
  return {
    id: nextId(),
    lang,
    code: code ?? langById(lang).starter,
    output: '',
    ok: true,
    busy: false,
    status: '',
  };
}

/* ------------------------------------------------------------------ */

export type CodeLabProps = {
  /** Read-only teaching material for the left pane. */
  lesson?: LessonCell[];
  /** Language the first practice cell starts in. */
  defaultLang?: LangId;
  /** Heading above the left pane. */
  title?: string;
  /** Notebook filename used for downloads. */
  filename?: string;
};

export default function CodeLab({
  lesson = [],
  defaultLang = 'python',
  title = 'Lesson',
  filename = 'notebook',
}: CodeLabProps): ReactNode {
  const [cells, setCells] = useState<Cell[]>([makeCell(defaultLang)]);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  const patch = useCallback((id: string, next: Partial<Cell>) => {
    setCells((cs) => cs.map((c) => (c.id === id ? { ...c, ...next } : c)));
  }, []);

  const runCell = useCallback(
    async (id: string) => {
      const cell = cellsRef.current.find((c) => c.id === id);
      if (!cell || cell.busy) return;
      patch(id, { busy: true, output: '', status: 'Preparing…' });
      const res = await runCode(cell.lang, cell.code, stdin, (m) => patch(id, { status: m }));
      patch(id, { busy: false, status: '', output: res.output, ok: res.ok });
    },
    [patch, stdin],
  );

  const runAll = useCallback(async () => {
    for (const c of cellsRef.current) {
      // sequential on purpose — output order should match cell order
      // eslint-disable-next-line no-await-in-loop
      await runCell(c.id);
    }
  }, [runCell]);

  const addCell = (afterId?: string, lang?: LangId) => {
    setCells((cs) => {
      const cell = makeCell(lang ?? cs[cs.length - 1]?.lang ?? defaultLang, lang ? undefined : '');
      if (!afterId) return [...cs, cell];
      const at = cs.findIndex((c) => c.id === afterId);
      return [...cs.slice(0, at + 1), cell, ...cs.slice(at + 1)];
    });
  };

  const copyToNotebook = (l: LessonCell) => {
    setCells((cs) => [...cs, makeCell(l.lang, l.code)]);
    requestAnimationFrame(() => {
      document.getElementById('codelab-notebook')?.scrollTo({
        top: 10 ** 6,
        behavior: 'smooth',
      });
    });
  };

  const removeCell = (id: string) =>
    setCells((cs) => (cs.length === 1 ? cs : cs.filter((c) => c.id !== id)));

  const moveCell = (id: string, dir: -1 | 1) =>
    setCells((cs) => {
      const at = cs.findIndex((c) => c.id === id);
      const to = at + dir;
      if (at < 0 || to < 0 || to >= cs.length) return cs;
      const copy = [...cs];
      [copy[at], copy[to]] = [copy[to], copy[at]];
      return copy;
    });

  const download = (what: 'ipynb' | 'source') => {
    let blob: Blob;
    let name: string;

    if (what === 'ipynb') {
      const nb = {
        cells: cells.map((c) => ({
          cell_type: 'code',
          execution_count: null,
          metadata: { language: c.lang },
          outputs: c.output
            ? [{ output_type: 'stream', name: 'stdout', text: c.output.split('\n') }]
            : [],
          source: c.code.split('\n').map((l, i, a) => (i === a.length - 1 ? l : l + '\n')),
        })),
        metadata: {
          kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
          language_info: { name: 'python' },
        },
        nbformat: 4,
        nbformat_minor: 5,
      };
      blob = new Blob([JSON.stringify(nb, null, 1)], { type: 'application/json' });
      name = `${filename}.ipynb`;
    } else {
      const spec = langById(cells[0].lang);
      const text = cells
        .map((c, i) => `// ---- cell ${i + 1} (${langById(c.lang).label}) ----\n${c.code}`)
        .join('\n\n');
      blob = new Blob([text], { type: 'text/plain' });
      name = `${filename}.${spec.ext}`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const el = document.activeElement as HTMLElement | null;
        const id = el?.dataset?.cellid;
        if (id) {
          e.preventDefault();
          runCell(id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runCell]);

  return (
    <div className={styles.lab}>
      {/* ------------------- left: lesson ------------------- */}
      <section className={styles.pane}>
        <header className={styles.paneHead}>
          <span className={styles.paneTitle}>{title}</span>
          <span className={styles.paneHint}>read along</span>
        </header>

        <div className={styles.paneBody}>
          {lesson.length === 0 && (
            <p className={styles.empty}>No lesson content on this page yet.</p>
          )}

          {lesson.map((l, i) => (
            <article key={i} className={styles.lesson}>
              {l.title && <h3 className={styles.lessonTitle}>{l.title}</h3>}
              {l.note && <p className={styles.lessonNote}>{l.note}</p>}

              <CodeBlock language={langById(l.lang).prism}>{l.code}</CodeBlock>

              {l.output && (
                <pre className={styles.lessonOut}>
                  <span className={styles.outLabel}>output</span>
                  {l.output}
                </pre>
              )}

              <button
                type="button"
                className={styles.tryBtn}
                onClick={() => copyToNotebook(l)}>
                Try this yourself →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------- right: notebook ------------------- */}
      <section className={styles.pane}>
        <header className={styles.paneHead}>
          <span className={styles.paneTitle}>Your notebook</span>
          <span className={styles.paneHint}>Ctrl + Enter to run a cell</span>
        </header>

        <div className={styles.toolbar}>
          <button type="button" className={styles.toolPrimary} onClick={runAll}>
            ▶▶ Run all
          </button>
          <button type="button" className={styles.tool} onClick={() => addCell()}>
            + Cell
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setShowStdin((v) => !v)}>
            {showStdin ? 'Hide input' : 'Input'}
          </button>
          <button type="button" className={styles.tool} onClick={() => download('ipynb')}>
            ↓ .ipynb
          </button>
          <button type="button" className={styles.tool} onClick={() => download('source')}>
            ↓ source
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setCells((cs) => cs.map((c) => ({ ...c, output: '' })))}>
            Clear output
          </button>
        </div>

        {showStdin && (
          <textarea
            className={styles.stdin}
            value={stdin}
            rows={3}
            placeholder="Standard input passed to every run (one value per line)"
            onChange={(e) => setStdin(e.target.value)}
          />
        )}

        <div className={styles.paneBody} id="codelab-notebook">
          {cells.map((c, i) => (
            <div key={c.id} className={styles.cell}>
              <div className={styles.cellHead}>
                <span className={styles.cellIndex}>[{i + 1}]</span>

                <select
                  className={styles.select}
                  value={c.lang}
                  onChange={(e) => {
                    const lang = e.target.value as LangId;
                    const wasStarter = c.code.trim() === langById(c.lang).starter.trim();
                    patch(c.id, {
                      lang,
                      code: wasStarter || !c.code.trim() ? langById(lang).starter : c.code,
                    });
                  }}>
                  {LANGS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>

                <span className={styles.spacer} />

                <button
                  type="button"
                  className={styles.icon}
                  title="Move up"
                  onClick={() => moveCell(c.id, -1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.icon}
                  title="Move down"
                  onClick={() => moveCell(c.id, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className={styles.icon}
                  title="Delete cell"
                  onClick={() => removeCell(c.id)}>
                  ✕
                </button>
              </div>

              <textarea
                className={styles.editor}
                data-cellid={c.id}
                value={c.code}
                spellCheck={false}
                rows={Math.max(5, Math.min(24, c.code.split('\n').length + 1))}
                onChange={(e) => patch(c.id, { code: e.target.value })}
                aria-label={`Cell ${i + 1} source`}
              />

              <div className={styles.cellBar}>
                <button
                  type="button"
                  className={styles.run}
                  disabled={c.busy}
                  onClick={() => runCell(c.id)}>
                  {c.busy ? 'Running…' : '▶ Run'}
                </button>
                <button
                  type="button"
                  className={styles.tool}
                  onClick={() => addCell(c.id)}>
                  + Cell below
                </button>
                {c.status && <span className={styles.status}>{c.status}</span>}
                {!c.status && langById(c.lang).local && (
                  <span className={styles.status}>runs in your browser</span>
                )}
              </div>

              {c.output && (
                <pre className={c.ok ? styles.out : styles.outErr}>
                  <span className={styles.outLabel}>output</span>
                  {c.output}
                </pre>
              )}
            </div>
          ))}

          <button type="button" className={styles.addBig} onClick={() => addCell()}>
            + Add cell
          </button>
        </div>
      </section>
    </div>
  );
}
