import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import { langById, runCode, type LangId } from '@site/src/lib/runners';
import appsData from '@site/src/data/apps.json';
import styles from './apps.module.css';

/**
 * Test Yourself — real applications, side by side with your own attempt.
 *
 * Left: the finished program and what it prints. Right: an editor that starts
 * from the same code, so you can change one line, run it, and see immediately
 * what that line was doing. Reading a program and running a program are
 * different skills; this page is for the second one.
 *
 * Everything comes from `src/data/apps.json`, which `tools/build_apps.py`
 * writes by scanning the `apps/` folder. Adding a hundredth application means
 * dropping a hundredth file in there — no code changes here.
 */

type App = {
  id: string;
  title: string;
  lang: LangId;
  langLabel: string;
  level: string;
  about: string;
  tags: string[];
  stdin: string;
  file: string;
  code: string;
};

const APPS = appsData as App[];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function AppsPage(): ReactNode {
  const [activeId, setActiveId] = useState(APPS[0]?.id ?? '');
  const [lang, setLang] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');

  const [code, setCode] = useState(APPS[0]?.code ?? '');
  const [stdin, setStdin] = useState(APPS[0]?.stdin ?? '');
  const [output, setOutput] = useState('');
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const languages = useMemo(
    () => [...new Set(APPS.map((a) => a.langLabel))].sort(),
    [],
  );

  const shown = useMemo(
    () =>
      APPS.filter((a) => {
        if (lang !== 'all' && a.langLabel !== lang) return false;
        if (level !== 'all' && a.level !== level) return false;
        if (!query.trim()) return true;
        const hay = `${a.title} ${a.about} ${a.tags.join(' ')} ${a.langLabel}`.toLowerCase();
        return hay.includes(query.trim().toLowerCase());
      }),
    [lang, level, query],
  );

  const active = APPS.find((a) => a.id === activeId) ?? APPS[0];

  const open = useCallback((app: App) => {
    setActiveId(app.id);
    setCode(app.code);
    setStdin(app.stdin);
    setOutput('');
    setStatus('');
  }, []);

  /** Hand the reader the file itself, named the way the project names it. */
  const download = useCallback(
    (which: 'mine' | 'original') => {
      if (!active) return;
      const body = which === 'mine' ? code : active.code;
      const name = active.file.split('/').pop() ?? 'program.txt';
      const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = which === 'mine' ? `my-${name}` : name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // release the object URL once the browser has taken the copy
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
    [active, code],
  );

  const run = useCallback(async () => {
    if (busy || !active) return;
    setBusy(true);
    setOutput('');
    setStatus('Preparing…');
    const res = await runCode(active.lang, code, stdin, setStatus);
    setOutput(res.output);
    setOk(res.ok);
    setStatus('');
    setBusy(false);
  }, [active, busy, code, stdin]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void run();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const el = e.currentTarget;
        const { selectionStart: s, selectionEnd: t } = el;
        setCode(`${code.slice(0, s)}    ${code.slice(t)}`);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = s + 4;
        });
      }
    },
    [code, run],
  );

  if (!active) {
    return (
      <Layout title="Test Yourself">
        <main className={styles.empty}>
          <h1>Test Yourself</h1>
          <p>
            No applications yet. Drop a program into <code>apps/&lt;language&gt;/</code> and
            run <code>python tools/build_apps.py</code>.
          </p>
        </main>
      </Layout>
    );
  }

  const dirty = code.trim() !== active.code.trim();

  return (
    <Layout
      title="Test Yourself"
      description={`${APPS.length} complete applications you can read on the left and rebuild on the right, in ${languages.length} languages.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Test yourself</p>
          <h1 className={styles.title}>Real applications, not exercises</h1>
          <p className={styles.lead}>
            Every program here is complete and runnable. Read it on the left, then change
            it on the right and run it — that is where the learning actually happens.
            <b> {APPS.length}</b> applications across <b>{languages.length}</b> languages.
          </p>
        </header>

        <div className={styles.filters}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search applications…"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search applications"
          />
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
            <option value="all">All languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
            <option value="all">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <span className={styles.tally}>{shown.length} shown</span>
        </div>

        <div className={styles.split}>
          {/* -------------------------------- left: the library */}
          <aside className={styles.left}>
            <ol className={styles.list}>
              {shown.map((app) => (
                <li key={app.id}>
                  <button
                    type="button"
                    className={app.id === activeId ? `${styles.item} ${styles.on}` : styles.item}
                    onClick={() => open(app)}>
                    <span className={styles.itemTop}>
                      <b>{app.title}</b>
                      <span className={styles.badge}>{app.langLabel}</span>
                    </span>
                    <small>{app.about}</small>
                    <span className={styles.level} data-level={app.level}>{app.level}</span>
                  </button>
                </li>
              ))}
              {shown.length === 0 && <li className={styles.none}>Nothing matches that.</li>}
            </ol>

            <section className={styles.reader}>
              <h2 className={styles.readerTitle}>{active.title}</h2>
              <p className={styles.readerAbout}>{active.about}</p>
              <p className={styles.file}>{active.file}</p>
              <CodeBlock language={langById(active.lang).prism}>{active.code}</CodeBlock>
              <button
                type="button"
                className={styles.download}
                onClick={() => download('original')}>
                <span aria-hidden="true">↓</span> Download {active.file.split('/').pop()}
              </button>
            </section>
          </aside>

          {/* ------------------------------ right: your attempt */}
          <section className={styles.right}>
            <div className={styles.bar}>
              <span className={styles.barTitle}>Your version</span>
              <span className={styles.barLang}>{active.langLabel}</span>
              {dirty && <span className={styles.dirty}>edited</span>}
              <button
                type="button"
                className={styles.ghost}
                onClick={() => download('mine')}
                title="Save your version to your computer">
                ↓ Download
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => { setCode(active.code); setStdin(active.stdin); }}>
                Reset to the original
              </button>
            </div>

            <textarea
              ref={editorRef}
              className={styles.editor}
              value={code}
              spellCheck={false}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label={`Your version of ${active.title}`}
            />

            <label className={styles.stdinLabel}>
              Input the program will read
              <textarea
                className={styles.stdin}
                rows={2}
                value={stdin}
                placeholder="One value per line, in the order the program asks for them"
                onChange={(e) => setStdin(e.target.value)}
              />
            </label>

            <div className={styles.actions}>
              <button type="button" className={styles.run} onClick={run} disabled={busy}>
                {busy ? 'Running…' : 'Run ▸'}
              </button>
              <span className={styles.kbd}>Ctrl + Enter</span>
              {status && <span className={styles.status}>{status}</span>}
              {output && (
                <button type="button" className={styles.ghost} onClick={() => setOutput('')}>
                  Clear output
                </button>
              )}
            </div>

            <pre className={output ? (ok ? styles.out : `${styles.out} ${styles.bad}`) : styles.outIdle}>
              {output || 'Output appears here once you run it.'}
            </pre>
          </section>
        </div>
      </main>
    </Layout>
  );
}
