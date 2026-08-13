import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { runCode, type LangId } from '@site/src/lib/runners';
import styles from './styles.module.css';

export type RunPythonProps = {
  /** Initial source shown in the editor. */
  code: string;
  /** Language to execute — defaults to Python. */
  lang?: LangId;
  /** Label shown in the header. */
  title?: string;
  rows?: number;
};

/**
 * A single runnable snippet — drop it into any .mdx page:
 *
 *   import RunPython from '@site/src/components/RunPython';
 *   <RunPython code={`print("hi")`} />
 */
export default function RunPython({ code, lang = 'python', title, rows }: RunPythonProps): ReactNode {
  const [source, setSource] = useState(code);
  const [output, setOutput] = useState('');
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const mounted = useRef(true);

  useEffect(() => setSource(code), [code]);
  useEffect(() => () => { mounted.current = false; }, []);

  const run = useCallback(async () => {
    setBusy(true);
    setOutput('');
    const res = await runCode(lang, source, '', (m) => mounted.current && setNote(m));
    if (!mounted.current) return;
    setNote('');
    setOutput(res.output);
    setOk(res.ok);
    setBusy(false);
  }, [lang, source]);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>{title ?? 'Python'}</span>
        <span className={styles.badge}>{lang === 'python' ? 'runs in your browser' : 'compiled for you'}</span>
      </div>

      <textarea
        className={styles.editor}
        value={source}
        rows={rows ?? Math.min(20, source.split('\n').length + 1)}
        spellCheck={false}
        onChange={(e) => setSource(e.target.value)}
        aria-label="Source code"
      />

      <div className={styles.bar}>
        <button type="button" className={styles.run} onClick={run} disabled={busy}>
          {busy ? 'Working…' : '▶ Run'}
        </button>
        <button
          type="button"
          className={styles.reset}
          onClick={() => { setSource(code); setOutput(''); }}>
          Reset
        </button>
        {note && <span className={styles.note}>{note}</span>}
      </div>

      {output && <pre className={ok ? styles.output : styles.outputError}>{output}</pre>}
    </div>
  );
}
