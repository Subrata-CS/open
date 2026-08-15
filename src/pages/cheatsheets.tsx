import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import { marked } from 'marked';
import sheetsData from '@site/src/data/sheets.json';
import styles from './cheatsheets.module.css';

/**
 * Cheat sheets, written as ordinary Markdown files.
 *
 * Everything here comes from `src/data/sheets.json`, which
 * `tools/build_sheets.py` writes by reading the `sheets/` folder. Adding a
 * sheet means writing a Markdown file and running that script — no code
 * changes, no registry, no limit.
 *
 * The Markdown is rendered in the browser rather than at build time so that a
 * sheet stays a plain file you can edit, diff and read on GitHub. Content
 * comes only from this repository, never from a reader, so there is no
 * untrusted HTML to worry about.
 */

type Sheet = {
  id: string;
  title: string;
  group: string;
  about: string;
  tags: string[];
  file: string;
  body: string;
};

const SHEETS = sheetsData as Sheet[];

export default function CheatSheets(): ReactNode {
  const [openId, setOpenId] = useState(SHEETS[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHEETS;
    return SHEETS.filter((s) =>
      `${s.title} ${s.group} ${s.about} ${s.tags.join(' ')} ${s.body}`
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Sheet[]>();
    for (const sheet of shown) {
      if (!groups.has(sheet.group)) groups.set(sheet.group, []);
      groups.get(sheet.group)!.push(sheet);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [shown]);

  const active = SHEETS.find((s) => s.id === openId) ?? SHEETS[0];

  const html = useMemo(
    () => (active ? (marked.parse(active.body, { async: false }) as string) : ''),
    [active],
  );

  // Keep the reader's place when they switch sheets.
  useEffect(() => {
    document.querySelector(`.${styles.reader}`)?.scrollTo({ top: 0 });
  }, [openId]);

  if (!active) {
    return (
      <Layout title="Cheat sheets">
        <main className={styles.empty}>
          <h1>Cheat sheets</h1>
          <p>
            None yet. Write a Markdown file into <code>sheets/</code> and run{' '}
            <code>python tools/build_sheets.py</code>.
          </p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout
      title="Cheat sheets"
      description={`${SHEETS.length} quick reference sheets for Git, Linux, SQL, Python and more.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Quick reference</p>
          <h1 className={styles.title}>Cheat sheets</h1>
          <p className={styles.lead}>
            The things worth having open in another tab. <b>{SHEETS.length}</b> sheets,
            each one a plain Markdown file in the repository.
          </p>
        </header>

        <div className={styles.split}>
          <aside className={styles.side}>
            <input
              className={styles.search}
              value={query}
              placeholder="Search every sheet…"
              aria-label="Search the cheat sheets"
              onChange={(e) => setQuery(e.target.value)}
            />

            {grouped.map(([group, sheets]) => (
              <section key={group} className={styles.group}>
                <h2 className={styles.groupTitle}>{group}</h2>
                <ul className={styles.list}>
                  {sheets.map((sheet) => (
                    <li key={sheet.id}>
                      <button
                        type="button"
                        className={sheet.id === openId ? `${styles.item} ${styles.on}` : styles.item}
                        onClick={() => setOpenId(sheet.id)}>
                        <b>{sheet.title}</b>
                        {sheet.about && <small>{sheet.about}</small>}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {shown.length === 0 && <p className={styles.none}>Nothing matches that.</p>}
          </aside>

          <article className={styles.reader}>
            <div className={styles.readerHead}>
              <h2>{active.title}</h2>
              <span className={styles.file}>{active.file}</span>
            </div>
            {/* Content is authored in this repository, not supplied by readers. */}
            <div className={styles.markdown} dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </main>
    </Layout>
  );
}
