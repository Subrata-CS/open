import { useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import styles from './tools.module.css';

/**
 * Developer tools that run entirely in the browser.
 *
 * Every one of these is normally a website that wants your data on its server.
 * Here the work happens on your own machine — nothing is uploaded, nothing is
 * logged, and they all keep working offline.
 */

type ToolId = 'json' | 'base64' | 'hash' | 'regex' | 'uuid' | 'convert';

const TOOLS: { id: ToolId; name: string; blurb: string }[] = [
  { id: 'json', name: 'JSON formatter', blurb: 'Pretty-print, minify and validate.' },
  { id: 'base64', name: 'Base64', blurb: 'Encode and decode text, both ways.' },
  { id: 'hash', name: 'Hash', blurb: 'SHA-1, SHA-256 and SHA-512 digests.' },
  { id: 'regex', name: 'Regex tester', blurb: 'Match, highlight and count.' },
  { id: 'uuid', name: 'UUID & random', blurb: 'Version 4 identifiers and tokens.' },
  { id: 'convert', name: 'Number base', blurb: 'Binary, octal, decimal, hex.' },
];

/* -------------------------------------------------------------------- JSON */

function JsonTool(): ReactNode {
  const [text, setText] = useState('{"name":"Asha","marks":[91,84],"passed":true}');
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    if (!text.trim()) return { ok: true, out: '' };
    try {
      const parsed = JSON.parse(text);
      const out = indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      const size = new Blob([out]).size;
      return { ok: true, out, note: `valid · ${size} bytes` };
    } catch (e) {
      return { ok: false, out: String(e).replace(/^SyntaxError:\s*/, '') };
    }
  }, [text, indent]);

  return (
    <>
      <textarea className={styles.input} rows={8} value={text}
        onChange={(e) => setText(e.target.value)} aria-label="JSON input" />
      <div className={styles.row}>
        {[0, 2, 4].map((n) => (
          <button key={n} type="button"
            className={indent === n ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            onClick={() => setIndent(n)}>
            {n === 0 ? 'minify' : `${n} spaces`}
          </button>
        ))}
        {result.note && <span className={styles.note}>{result.note}</span>}
      </div>
      <pre className={result.ok ? styles.out : `${styles.out} ${styles.bad}`}>{result.out}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ base64 */

function Base64Tool(): ReactNode {
  const [text, setText] = useState('Open — A to Z Computer Science');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const result = useMemo(() => {
    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach((b) => { binary += String.fromCharCode(b); });
        return { ok: true, out: btoa(binary) };
      }
      const binary = atob(text.trim());
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return { ok: true, out: new TextDecoder().decode(bytes) };
    } catch {
      return { ok: false, out: 'That is not valid Base64.' };
    }
  }, [text, mode]);

  return (
    <>
      <div className={styles.row}>
        {(['encode', 'decode'] as const).map((m) => (
          <button key={m} type="button"
            className={mode === m ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      <textarea className={styles.input} rows={6} value={text}
        onChange={(e) => setText(e.target.value)} aria-label="Text" />
      <pre className={result.ok ? styles.out : `${styles.out} ${styles.bad}`}>{result.out}</pre>
    </>
  );
}

/* -------------------------------------------------------------------- hash */

function HashTool(): ReactNode {
  const [text, setText] = useState('hello world');
  const [digests, setDigests] = useState<[string, string][]>([]);
  const [busy, setBusy] = useState(false);

  const compute = async () => {
    setBusy(true);
    const bytes = new TextEncoder().encode(text);
    const out: [string, string][] = [];
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-512']) {
      const buf = await crypto.subtle.digest(algo, bytes);
      const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
      out.push([algo, hex]);
    }
    setDigests(out);
    setBusy(false);
  };

  return (
    <>
      <textarea className={styles.input} rows={4} value={text}
        onChange={(e) => setText(e.target.value)} aria-label="Text to hash" />
      <div className={styles.row}>
        <button type="button" className={styles.go} onClick={compute} disabled={busy}>
          {busy ? 'Hashing…' : 'Hash it'}
        </button>
        <span className={styles.note}>computed by your browser, not sent anywhere</span>
      </div>
      {digests.map(([algo, hex]) => (
        <div key={algo} className={styles.pair}>
          <span className={styles.pairKey}>{algo}</span>
          <code className={styles.pairValue}>{hex}</code>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------- regex */

function RegexTool(): ReactNode {
  const [pattern, setPattern] = useState('\\b[a-z]+@[a-z]+\\.[a-z]{2,}\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState(
    'Write to asha@example.com or rahul@college.ac.in before Friday. Not an email: hello@world',
  );

  const result = useMemo(() => {
    if (!pattern) return { ok: true, matches: [] as string[] };
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
      return { ok: true, matches: [...text.matchAll(re)].map((m) => m[0]) };
    } catch (e) {
      return { ok: false, error: String(e).replace(/^SyntaxError:\s*/, ''), matches: [] };
    }
  }, [pattern, flags, text]);

  return (
    <>
      <div className={styles.row}>
        <input className={styles.line} value={pattern} aria-label="Pattern"
          onChange={(e) => setPattern(e.target.value)} placeholder="pattern" />
        <input className={styles.flags} value={flags} aria-label="Flags"
          onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))} placeholder="flags" />
      </div>
      <textarea className={styles.input} rows={5} value={text}
        onChange={(e) => setText(e.target.value)} aria-label="Test string" />
      {result.ok ? (
        <>
          <p className={styles.note}>{result.matches.length} matches</p>
          <pre className={styles.out}>{result.matches.map((m, i) => `${i + 1}. ${m}`).join('\n') || '(none)'}</pre>
        </>
      ) : (
        <pre className={`${styles.out} ${styles.bad}`}>{result.error}</pre>
      )}
    </>
  );
}

/* -------------------------------------------------------------------- uuid */

function UuidTool(): ReactNode {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);

  const generate = () => {
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : [...crypto.getRandomValues(new Uint8Array(16))]
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
              .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'),
      );
    }
    setIds(out);
  };

  return (
    <>
      <div className={styles.row}>
        <label className={styles.note}>
          how many
          <input type="range" min="1" max="20" value={count}
            onChange={(e) => setCount(Number(e.target.value))} />
          <b>{count}</b>
        </label>
        <button type="button" className={styles.go} onClick={generate}>Generate</button>
      </div>
      <pre className={styles.out}>{ids.join('\n') || 'Press generate.'}</pre>
    </>
  );
}

/* ----------------------------------------------------------------- convert */

function ConvertTool(): ReactNode {
  const [value, setValue] = useState('255');
  const [base, setBase] = useState(10);

  const parsed = useMemo(() => {
    const clean = value.trim().replace(/\s+/g, '');
    if (!clean) return null;
    const n = parseInt(clean, base);
    return Number.isNaN(n) ? null : n;
  }, [value, base]);

  return (
    <>
      <div className={styles.row}>
        {[2, 8, 10, 16].map((b) => (
          <button key={b} type="button"
            className={base === b ? `${styles.chip} ${styles.chipOn}` : styles.chip}
            onClick={() => setBase(b)}>
            base {b}
          </button>
        ))}
      </div>
      <input className={styles.line} value={value} aria-label="Number"
        onChange={(e) => setValue(e.target.value)} />
      {parsed === null ? (
        <pre className={`${styles.out} ${styles.bad}`}>Not a valid base-{base} number.</pre>
      ) : (
        <>
          {([['binary', 2], ['octal', 8], ['decimal', 10], ['hexadecimal', 16]] as const).map(
            ([name, b]) => (
              <div key={b} className={styles.pair}>
                <span className={styles.pairKey}>{name}</span>
                <code className={styles.pairValue}>
                  {b === 16 ? parsed.toString(16).toUpperCase() : parsed.toString(b)}
                </code>
              </div>
            ),
          )}
          <p className={styles.note}>
            {parsed.toString(2).length} bits · fits in{' '}
            {parsed < 256 ? 'one byte' : parsed < 65536 ? 'two bytes' : 'four bytes'}
          </p>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- shell */

export default function Tools(): ReactNode {
  const [open, setOpen] = useState<ToolId>('json');
  const active = TOOLS.find((t) => t.id === open)!;

  return (
    <Layout title="Tools" description="Developer tools that run entirely in your browser — JSON, Base64, hashing, regex, UUIDs and number bases.">
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Utilities</p>
          <h1 className={styles.title}>Tools</h1>
          <p className={styles.lead}>
            The small things you reach for while working. All six run on your own
            machine — nothing is uploaded, nothing is stored, and they work offline.
          </p>
        </header>

        <nav className={styles.tabs} aria-label="Tools">
          {TOOLS.map((t) => (
            <button key={t.id} type="button"
              className={t.id === open ? `${styles.tab} ${styles.tabOn}` : styles.tab}
              onClick={() => setOpen(t.id)}>
              <b>{t.name}</b>
              <small>{t.blurb}</small>
            </button>
          ))}
        </nav>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>{active.name}</h2>
          {open === 'json' && <JsonTool />}
          {open === 'base64' && <Base64Tool />}
          {open === 'hash' && <HashTool />}
          {open === 'regex' && <RegexTool />}
          {open === 'uuid' && <UuidTool />}
          {open === 'convert' && <ConvertTool />}
        </section>
      </main>
    </Layout>
  );
}
