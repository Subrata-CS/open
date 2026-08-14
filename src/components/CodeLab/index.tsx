import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import { LANGS, langById, runCode, type LangId } from '@site/src/lib/runners';
import { removeDataFile, writeDataFiles, writeTextFile, type DataFile } from '@site/src/lib/pyodide';
import { SAMPLES } from '@site/src/lib/samples';
import { clearHandoff, takeHandoff, type Handoff } from '@site/src/lib/handoff';
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

/** Programs that read from standard input need the Input box (or a prompt). */
const NEEDS_STDIN = /\b(input\s*\(|sys\.stdin|scanf\s*\(|cin\s*>>|Scanner\s*\(|readLine|gets\s*\()/;

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
  const [showStdin, setShowStdin] = useState(true);
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);
  const [dataBusy, setDataBusy] = useState('');
  const [showData, setShowData] = useState(false);
  const [back, setBack] = useState<Handoff | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  // A reader arrived from a topic page — load their snippet and offer a way back.
  useEffect(() => {
    const handoff = takeHandoff();
    if (!handoff) return;
    clearHandoff();
    setBack(handoff);
    setCells([makeCell(handoff.lang, handoff.code || undefined)]);
  }, []);

  const addDataFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setDataBusy('Loading into Python…');
    try {
      const written = await writeDataFiles(Array.from(files));
      setDataFiles((prev) => [...prev.filter((f) => !written.some((w) => w.name === f.name)), ...written]);
    } catch (err) {
      setDataBusy(String(err));
      return;
    }
    setDataBusy('');
  }, []);

  const addSample = useCallback(async (index: number) => {
    const sample = SAMPLES[index];
    setDataBusy('Preparing dataset…');
    try {
      const written = await writeTextFile(sample.file, sample.csv);
      setDataFiles((prev) => [...prev.filter((f) => f.name !== written.name), written]);
      setCells((cs) => [...cs, makeCell('python', sample.snippet)]);
    } catch (err) {
      setDataBusy(String(err));
      return;
    }
    setDataBusy('');
  }, []);

  const dropData = useCallback(async (name: string) => {
    await removeDataFile(name);
    setDataFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const patch = useCallback((id: string, next: Partial<Cell>) => {
    setCells((cs) => cs.map((c) => (c.id === id ? { ...c, ...next } : c)));
  }, []);

  const runCell = useCallback(
    async (id: string) => {
      const cell = cellsRef.current.find((c) => c.id === id);
      if (!cell || cell.busy) return;
      if (NEEDS_STDIN.test(cell.code) && !stdin.trim()) setShowStdin(true);
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
          {back ? (
            <Link className={styles.backLink} to={back.returnUrl}>
              ← Back to {back.returnTitle}
            </Link>
          ) : (
            <span className={styles.paneHint}>Ctrl + Enter to run a cell</span>
          )}
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
            className={showData ? styles.toolOn : styles.tool}
            onClick={() => setShowData((v) => !v)}>
            ⛁ Data{dataFiles.length > 0 ? ` (${dataFiles.length})` : ''}
          </button>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setShowStdin((v) => !v)}>
            {showStdin ? 'Hide input' : 'Input / Output'}
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

        {showData && (
          <div className={styles.dataPanel}>
            <p className={styles.dataLead}>
              Files land next to your code, exactly like a Kaggle or Colab notebook —
              read them with <code>pd.read_csv("name.csv")</code>. Everything stays in
              your browser; nothing is uploaded anywhere.
            </p>

            <div className={styles.dataActions}>
              <button
                type="button"
                className={styles.toolPrimary}
                onClick={() => fileInput.current?.click()}>
                ＋ Upload files
              </button>
              <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  void addDataFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              {dataBusy && <span className={styles.status}>{dataBusy}</span>}
            </div>

            {dataFiles.length > 0 && (
              <ul className={styles.fileList}>
                {dataFiles.map((f) => (
                  <li key={f.name} className={styles.file}>
                    <span className={styles.fileName}>{f.name}</span>
                    <span className={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button"
                      className={styles.icon}
                      title="Remove"
                      onClick={() => void dropData(f.name)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className={styles.dataSub}>Or start from a built-in dataset</p>
            <div className={styles.sampleGrid}>
              {SAMPLES.map((sample, i) => (
                <button
                  key={sample.file}
                  type="button"
                  className={styles.sample}
                  onClick={() => void addSample(i)}>
                  <span className={styles.sampleName}>{sample.name}</span>
                  <span className={styles.sampleMeta}>
                    {sample.file} · {sample.rows} rows
                  </span>
                  <span className={styles.sampleBlurb}>{sample.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showStdin && (
          <div className={styles.ioPanel}>
            <div className={styles.ioHead}>
              <span className={styles.ioTitle}>Input</span>
              <span className={styles.ioHint}>
                one value per line, in the order the program asks for them
              </span>
            </div>
            <textarea
              className={styles.stdin}
              value={stdin}
              rows={4}
              placeholder={'e.g.\n5\nAsha\n42'}
              onChange={(e) => setStdin(e.target.value)}
              aria-label="Standard input"
            />
            <p className={styles.ioNote}>
              Anything a program reads with <code>input()</code>, <code>scanf</code>,{' '}
              <code>cin &gt;&gt;</code> or <code>Scanner</code> is taken from here — no need to
              write it anywhere else. Output appears under each cell after you run it.
            </p>
          </div>
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
                {!c.status && NEEDS_STDIN.test(c.code) && (
                  <span className={styles.hint}>
                    reads input — fill the Input box, or answer the prompts
                  </span>
                )}
                {!c.status && !NEEDS_STDIN.test(c.code) && langById(c.lang).local && (
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
