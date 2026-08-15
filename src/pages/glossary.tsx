import { useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import topicsData from '@site/src/data/topics.json';
import tracksData from '@site/src/data/tracks.json';
import { toneOf } from '@site/src/lib/tones';
import styles from './glossary.module.css';

/**
 * An A–Z index of every topic on the site.
 *
 * Built from `src/data/topics.json`, which the generator writes from the
 * syllabus — so a topic added tomorrow appears here with no further work.
 * Type-to-filter, jump by letter, or narrow to one track.
 */

type Topic = {
  title: string;
  href: string;
  section: string;
  sectionNum: number;
  track: string;
  tone: string;
};

const TOPICS = topicsData as Topic[];
const TRACKS = (tracksData as { label: string; tone: string }[]).map((t) => t.label);
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

function initial(title: string): string {
  const first = title.trim()[0]?.toUpperCase() ?? '#';
  return /[A-Z]/.test(first) ? first : '#';
}

export default function Glossary(): ReactNode {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('all');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = new Map<string, Topic[]>();

    for (const topic of TOPICS) {
      if (track !== 'all' && topic.track !== track) continue;
      if (q && !`${topic.title} ${topic.section}`.toLowerCase().includes(q)) continue;
      const key = initial(topic.title);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(topic);
    }

    for (const list of groups.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return groups;
  }, [query, track]);

  const total = useMemo(
    () => [...grouped.values()].reduce((n, list) => n + list.length, 0),
    [grouped],
  );

  return (
    <Layout
      title="Glossary"
      description={`An A to Z index of all ${TOPICS.length} computer science topics on the site.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>A to Z</p>
          <h1 className={styles.title}>Glossary</h1>
          <p className={styles.lead}>
            Every topic on the site in one alphabetical list — <b>{TOPICS.length}</b> of
            them. Useful when you know the word but not where it lives.
          </p>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search the glossary…"
            aria-label="Search the glossary"
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Track">
            <option value="all">All tracks</option>
            {TRACKS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className={styles.count}>{total} shown</span>
        </div>

        <nav className={styles.alphabet} aria-label="Jump to a letter">
          {LETTERS.map((letter) => {
            const has = grouped.has(letter);
            return has ? (
              <a key={letter} href={`#letter-${letter}`} className={styles.letter}>
                {letter}
              </a>
            ) : (
              <span key={letter} className={`${styles.letter} ${styles.off}`}>{letter}</span>
            );
          })}
        </nav>

        {total === 0 && <p className={styles.none}>Nothing matches that.</p>}

        {LETTERS.filter((l) => grouped.has(l)).map((letter) => (
          <section key={letter} className={styles.group} id={`letter-${letter}`}>
            <h2 className={styles.groupTitle}>{letter}</h2>
            <ul className={styles.entries}>
              {grouped.get(letter)!.map((topic) => (
                <li key={topic.href}>
                  <Link
                    className={styles.entry}
                    to={topic.href}
                    style={{ borderLeftColor: toneOf(topic.tone).base }}>
                    <b>{topic.title}</b>
                    <small>
                      {String(topic.sectionNum).padStart(2, '0')} · {topic.section}
                    </small>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </Layout>
  );
}
