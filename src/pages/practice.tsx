import { useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import AddButton from '@site/src/components/AddButton';
import Link from '@docusaurus/Link';
import platformsData from '@site/src/data/platforms.json';
import styles from './practice.module.css';

/**
 * Every good place to practise, in one directory.
 *
 * The site teaches and lets you run code; these are where you go to grind,
 * compete and build. Each opens in a new tab so this page — and whatever you
 * were reading — is still here when you come back.
 *
 * Everything comes from `src/data/platforms.json`, which
 * `tools/build_platforms.py` writes from the `platforms/` folder. Adding a
 * site means adding one Markdown line.
 */

type Group = {
  id: string;
  title: string;
  about: string;
  order: number;
  file: string;
  links: { name: string; url: string; about: string }[];
};

const GROUPS = platformsData as Group[];
const TOTAL = GROUPS.reduce((n, g) => n + g.links.length, 0);

/** Show the bare domain — readers recognise sites by it. */
function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function Practice(): ReactNode {
  const [query, setQuery] = useState('');
  const [only, setOnly] = useState('all');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((group) => ({
      ...group,
      links: group.links.filter(
        (l) => !q || `${l.name} ${l.about} ${l.url}`.toLowerCase().includes(q),
      ),
    })).filter((g) => g.links.length > 0 && (only === 'all' || g.id === only));
  }, [query, only]);

  const count = shown.reduce((n, g) => n + g.links.length, 0);

  return (
    <Layout
      title="Practice"
      description={`${TOTAL} places to practise programming — problem sets, contests, project briefs, notebooks and courses.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Where to practise</p>
          <h1 className={styles.title}>Practice platforms</h1>
          <p className={styles.lead}>
            This site teaches the ideas and lets you run code against them. These{' '}
            <b>{TOTAL}</b> places are where you go to drill, compete and build something
            of your own. Each opens in a new tab, so your place here is kept — come
            straight back and carry on.
          </p>

          <div className={styles.headActions}>
            <AddButton folder="platforms" what="platform" template={`---
title: My new category
about: One line describing this group.
order: 11
---

- [Site name](https://example.com/) — one line on why it is worth using.
`} />
          </div>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search all platforms…"
            aria-label="Search platforms"
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={only} onChange={(e) => setOnly(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <span className={styles.count}>{count} shown</span>
        </div>

        {count === 0 && <p className={styles.none}>Nothing matches that.</p>}

        {shown.map((group) => (
          <section key={group.id} className={styles.group}>
            <div className={styles.groupHead}>
              <span className={styles.order}>{String(group.order).padStart(2, '0')}</span>
              <div>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                {group.about && <p className={styles.groupAbout}>{group.about}</p>}
              </div>
              <span className={styles.groupCount}>{group.links.length}</span>
            </div>

            <ul className={styles.grid}>
              {group.links.map((link) => (
                <li key={link.url}>
                  <Link
                    className={styles.card}
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    <span className={styles.cardTop}>
                      <b>{link.name}</b>
                      <span className={styles.go} aria-hidden="true">↗</span>
                    </span>
                    <small className={styles.host}>{host(link.url)}</small>
                    {link.about && <p className={styles.about}>{link.about}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.footnote}>
          Most of these are free. A few — AlgoExpert, DataCamp — charge for the full
          course and are marked as such above. Nothing here pays us anything; they are
          listed because they are good.
        </p>
      </main>
    </Layout>
  );
}
