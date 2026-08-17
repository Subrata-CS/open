import { useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import AddButton from '@site/src/components/AddButton';
import careersData from '@site/src/data/careers.json';
import styles from './careers.module.css';

/**
 * Every company's own careers page, in one place.
 *
 * Job boards go stale and aggregators bury the real listing three redirects
 * deep. These are the official portals — the page the company itself posts to
 * — so a role you find here is a role that exists.
 *
 * Two ways to read it: by category, which is how you browse when you do not
 * know where you want to work yet, and A to Z, which is how you look someone
 * up when you already do.
 *
 * Everything comes from `src/data/careers.json`, which
 * `tools/build_careers.py` writes from the `careers/` folder. Adding a company
 * is one Markdown line, and the builder refuses to list the same employer
 * twice.
 */

type Company = { name: string; url: string; about: string };

type Group = {
  id: string;
  title: string;
  about: string;
  order: number;
  file: string;
  links: Company[];
};

const GROUPS = careersData as Group[];
const TOTAL = GROUPS.reduce((n, g) => n + g.links.length, 0);

const TEMPLATE = `---
title: My new group
about: One line describing which companies belong in this group.
order: 12
---

- [Company name](https://example.com/careers) — one line on what they build.
`;

/** Show the bare domain — readers recognise a real careers portal by it. */
function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The letter a company files under. Anything not A–Z lands in "#". */
function letterOf(name: string): string {
  const first = name.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase();
  return first >= 'A' && first <= 'Z' ? first : '#';
}

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Careers(): ReactNode {
  const [query, setQuery] = useState('');
  const [only, setOnly] = useState('all');
  const [view, setView] = useState<'category' | 'az'>('category');

  const matches = (c: Company, q: string) =>
    !q || `${c.name} ${c.about} ${c.url}`.toLowerCase().includes(q);

  /** Category view: the groups as written, filtered. */
  const byCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((g) => ({ ...g, links: g.links.filter((c) => matches(c, q)) })).filter(
      (g) => g.links.length > 0 && (only === 'all' || g.id === only),
    );
  }, [query, only]);

  /** A–Z view: one flat list, bucketed by first letter. */
  const byLetter = useMemo(() => {
    const q = query.trim().toLowerCase();
    const flat = GROUPS.filter((g) => only === 'all' || g.id === only)
      .flatMap((g) => g.links.map((c) => ({ ...c, group: g.title })))
      .filter((c) => matches(c, q))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

    const buckets = new Map<string, typeof flat>();
    for (const company of flat) {
      const letter = letterOf(company.name);
      const bucket = buckets.get(letter);
      if (bucket) bucket.push(company);
      else buckets.set(letter, [company]);
    }
    return ALPHABET.filter((l) => buckets.has(l)).map((l) => ({
      letter: l,
      items: buckets.get(l)!,
    }));
  }, [query, only]);

  const count =
    view === 'category'
      ? byCategory.reduce((n, g) => n + g.links.length, 0)
      : byLetter.reduce((n, l) => n + l.items.length, 0);

  return (
    <Layout
      title="Global Career Links"
      description={`${TOTAL} official company career portals — big tech, AI labs, chips, security, IT services and more.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Where to apply</p>
          <h1 className={styles.title}>Global Career Links</h1>
          <p className={styles.lead}>
            The official careers portal for <b>{TOTAL}</b> companies — the page each one
            posts to itself, not a job board that scraped it a month ago. Browse by
            category when you are still deciding, or by A–Z when you already know the
            name. Every link opens in a new tab.
          </p>

          <div className={styles.headActions}>
            <AddButton folder="careers" what="category" template={TEMPLATE} />
            <span className={styles.hint}>
              Or press <b>+</b> on any group below to add a single company — name and
              link, one line, straight in GitHub.
            </span>
          </div>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search companies…"
            aria-label="Search companies"
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={only} onChange={(e) => setOnly(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <div className={styles.toggle} role="group" aria-label="View">
            <button
              type="button"
              className={view === 'category' ? styles.on : undefined}
              aria-pressed={view === 'category'}
              onClick={() => setView('category')}>
              Category
            </button>
            <button
              type="button"
              className={view === 'az' ? styles.on : undefined}
              aria-pressed={view === 'az'}
              onClick={() => setView('az')}>
              A–Z
            </button>
          </div>
          <span className={styles.count}>{count} shown</span>
        </div>

        {count === 0 && <p className={styles.none}>No company matches that.</p>}

        {view === 'az' && count > 0 && (
          <nav className={styles.jump} aria-label="Jump to letter">
            {byLetter.map(({ letter }) => (
              <a key={letter} href={`#letter-${letter === '#' ? 'other' : letter}`}>
                {letter}
              </a>
            ))}
          </nav>
        )}

        {view === 'category' &&
          byCategory.map((group) => (
            <section key={group.id} className={styles.group}>
              <div className={styles.groupHead}>
                <span className={styles.order}>{String(group.order).padStart(2, '0')}</span>
                <div>
                  <h2 className={styles.groupTitle}>{group.title}</h2>
                  {group.about && <p className={styles.groupAbout}>{group.about}</p>}
                </div>
                <span className={styles.groupCount}>{group.links.length}</span>
                <AddButton edit={group.file} what={`company to ${group.title}`} compact />
              </div>

              <ul className={styles.grid}>
                {group.links.map((company) => (
                  <li key={company.url + company.name}>
                    <Card company={company} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

        {view === 'az' &&
          byLetter.map(({ letter, items }) => (
            <section
              key={letter}
              className={styles.group}
              id={`letter-${letter === '#' ? 'other' : letter}`}>
              <div className={styles.groupHead}>
                <span className={styles.letter}>{letter}</span>
                <div>
                  <h2 className={styles.groupTitle}>
                    {letter === '#' ? 'Numbers and symbols' : letter}
                  </h2>
                </div>
                <span className={styles.groupCount}>{items.length}</span>
              </div>

              <ul className={styles.grid}>
                {items.map((company) => (
                  <li key={company.url + company.name}>
                    <Card company={company} tag={company.group} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

        <p className={styles.footnote}>
          Portals move. If one of these lands on a 404, press <b>+</b> on that group and
          fix the line — it is a single Markdown edit, and the site rebuilds itself.
          Nothing here is sponsored and no company has paid to be on this page.
        </p>
      </main>
    </Layout>
  );
}

function Card({ company, tag }: { company: Company; tag?: string }): ReactNode {
  return (
    <Link className={styles.card} to={company.url} target="_blank" rel="noopener noreferrer">
      <span className={styles.cardTop}>
        <b>{company.name}</b>
        <span className={styles.go} aria-hidden="true">
          ↗
        </span>
      </span>
      <small className={styles.host}>{host(company.url)}</small>
      {company.about && <p className={styles.about}>{company.about}</p>}
      {tag && <span className={styles.tag}>{tag}</span>}
    </Link>
  );
}
