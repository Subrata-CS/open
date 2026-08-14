import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { LANGS, langById, runCode, type LangId } from '@site/src/lib/runners';
import styles from './styles.module.css';

/**
 * A complete, runnable code cell that lives inside the page.
 *
 * The reader never leaves the topic they are studying: open the cell, write
 * something, run it, read the output, close it and carry on reading. The full
 * Code Lab is still one click away for longer work.
 */

const NEEDS_STDIN =
  /\b(input\s*\(|sys\.stdin|scanf\s*\(|cin\s*>>|Scanner\s*\(|readLine|gets\s*\()/;

export type InlineLabProps = {
  topic: string;
  lang: LangId;
  code?: string;
  /** Called when the reader closes the cell. */
  onClose?: () => void;
  /** Hands the current snippet to the full Code Lab before navigating there. */
  onExpand?: (lang: LangId, code: string) => void;
};

export default function InlineLab({
  topic,
  lang: initialLang,
  code: initialCode,
  onClose,
  onExpand,
}: InlineLabProps): ReactNode {
  const [lang, setLang] = useState<LangId>(initialLang);
  const [code, setCode] = useState(initialCode ?? langById(initialLang).starter);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [output, setOutput] = useState('');
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    areaRef.current?.focus();
  }, []);

  const swapLang = useCallback(
    (next: LangId) => {
      const wasStarter = code.trim() === langById(lang).starter.trim();
      setLang(next);
      if (wasStarter || code.trim() === '') setCode(langById(next).starter);
    },
    [code, lang],
  );

  const run = useCallback(async () => {
    if (busy) return;
    if (NEEDS_STDIN.test(code) && !stdin.trim()) setShowStdin(true);
    setBusy(true);
    setOutput('');
    setStatus('Preparing…');
    const res = await runCode(lang, code, stdin, setStatus);
    setOutput(res.output);
    setOk(res.ok);
    setStatus('');
    setBusy(false);
  }, [busy, code, lang, stdin]);

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
        const next = `${code.slice(0, s)}    ${code.slice(t)}`;
        setCode(next);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = s + 4;
        });
      }
    },
    [code, run],
  );

  const spec = langById(lang);

  return (
    <div className={styles.cell}>
      <div className={styles.bar}>
        <select
          className={styles.select}
          value={lang}
          onChange={(e) => swapLang(e.target.value as LangId)}
          aria-label="Language">
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        <span className={styles.where}>
          {spec.local ? 'runs in your browser' : 'compiled online'}
        </span>

        <button
          type="button"
          className={styles.ghost}
          onClick={() => setShowStdin((v) => !v)}>
          {showStdin ? 'Hide input' : 'Input'}
        </button>

        {onExpand && (
          <Link
            className={styles.ghost}
            to="/playground"
            onClick={() => onExpand(lang, code)}
            title="Open this snippet in the full Code Lab">
            Full Code Lab ↗
          </Link>
        )}

        {onClose && (
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close the practice cell">
            Close ✕
          </button>
        )}
      </div>

      <textarea
        ref={areaRef}
        className={styles.editor}
        value={code}
        spellCheck={false}
        rows={Math.min(20, Math.max(7, code.split('\n').length + 1))}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={`Code for ${topic}`}
      />

      {showStdin && (
        <textarea
          className={styles.stdin}
          value={stdin}
          rows={3}
          placeholder="Standard input — one value per line"
          onChange={(e) => setStdin(e.target.value)}
          aria-label="Standard input"
        />
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.run} onClick={run} disabled={busy}>
          {busy ? 'Running…' : 'Run ▸'}
        </button>
        <span className={styles.kbd}>Ctrl + Enter</span>
        {output && (
          <button type="button" className={styles.ghost} onClick={() => setOutput('')}>
            Clear output
          </button>
        )}
        <button
          type="button"
          className={styles.ghost}
          onClick={() => setCode(langById(lang).starter)}>
          Reset
        </button>
        {status && <span className={styles.status}>{status}</span>}
      </div>

      {output && (
        <pre className={ok ? styles.out : `${styles.out} ${styles.bad}`}>{output}</pre>
      )}
    </div>
  );
}
