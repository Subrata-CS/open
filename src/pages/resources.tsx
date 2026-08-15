import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import AddButton from '@site/src/components/AddButton';
import resourcesData from '@site/src/data/resources.json';
import { toneOf } from '@site/src/lib/tones';
import styles from './resources.module.css';

/**
 * One world-class course for every section of the syllabus.
 *
 * The notes here are a map; these are the territory — the courses MIT,
 * Stanford, Berkeley, Harvard and Princeton actually teach from, all free to
 * read. Where a resource names a section, it links both ways: to the course,
 * and back into our own notes on the same subject.
 *
 * Written from `resources/*.md` by `tools/build_resources.py`, so a new
 * resource is one Markdown line.
 */

type Item = {
  section: number | null;
  name: string;
  url: string;
  about: string;
  sectionTitle: string;
  sectionHref: string;
  tone: string;
};

type Group = { id: string; title: string; about: string; order: number; file: string; items: Item[] };

const GROUPS = resourcesData as Group[];
const TOTAL = GROUPS.reduce((n, g) => n + g.items.length, 0);

const TEMPLATE = `---
title: My new group
about: One line describing what this group is for.
order: 6
---

- 07 | [Course or book name](https://example.com/) — one line on why it is worth the time.
`;

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function Resources(): ReactNode {
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => !q || `${i.name} ${i.about} ${i.sectionTitle} ${i.url}`.toLowerCase().includes(q),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const count = shown.reduce((n, g) => n + g.items.length, 0);

  return (
    <Layout
      title="Resources"
      description={`${TOTAL} world-class courses and books, one for every section of the syllabus.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Go deeper</p>
          <h1 className={styles.title}>Resources</h1>
          <p className={styles.lead}>
            For every section of the syllabus, the course a university would actually
            teach it from — MIT, Stanford, Berkeley, Harvard, Princeton. All{' '}
            <b>{TOTAL}</b> are free to read, and every link here has been checked.
          </p>
          <div className={styles.headActions}>
            <AddButton folder="resources" what="resource" template={TEMPLATE} />
          </div>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search courses, books and sections…"
            aria-label="Search resources"
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.count}>{count} shown</span>
        </div>

        {count === 0 && <p className={styles.none}>Nothing matches that.</p>}

        {shown.map((group) => (
          <section key={group.id} className={styles.group}>
            <div className={styles.groupHead}>
              <div>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                {group.about && <p className={styles.groupAbout}>{group.about}</p>}
              </div>
              <span className={styles.groupCount}>{group.items.length}</span>
            </div>

            <ul className={styles.list}>
              {group.items.map((item) => {
                const colour = toneOf(item.tone);
                return (
                  <li
                    key={item.url + item.name}
                    className={styles.row}
                    style={{ '--tone': colour.base, '--tone-rgb': colour.rgb } as CSSProperties}>
                    {item.section !== null && (
                      <Link className={styles.section} to={item.sectionHref}>
                        <b>{String(item.section).padStart(2, '0')}</b>
                        <small>{item.sectionTitle}</small>
                      </Link>
                    )}

                    <Link
                      className={styles.course}
                      to={item.url}
                      target="_blank"
                      rel="noopener noreferrer">
                      <span className={styles.courseTop}>
                        <b>{item.name}</b>
                        <span className={styles.go} aria-hidden="true">↗</span>
                      </span>
                      <small className={styles.host}>{host(item.url)}</small>
                      {item.about && <p className={styles.about}>{item.about}</p>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

      </main>
    </Layout>
  );
}
