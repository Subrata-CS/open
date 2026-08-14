import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Globe from '@site/src/components/Globe';
import HeroVisual from '@site/src/components/HeroVisual';
import stats from '@site/src/data/stats.json';
import tracksData from '@site/src/data/tracks.json';
import { LANGS } from '@site/src/lib/runners';
import { toneOf } from '@site/src/lib/tones';
import styles from './index.module.css';

/**
 * Everything on this page is computed, never typed.
 *
 * `tools/generate.py` rewrites src/data/{stats,tracks,sections}.json from
 * tools/syllabus.txt, so section ranges ("01 - 06"), topic counts, the number
 * of tracks and the nodes on the globe all follow the syllabus by themselves.
 */

type Track = {
  id: string;
  label: string;
  tone: string;
  blurb: string;
  badge: string;
  sectionCount: number;
  topics: number;
  href: string;
  sections: { num: number; title: string; href: string; topics: number }[];
};

const TRACKS = tracksData as Track[];

/* ------------------------------------------------------------------ hero */

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Open · free forever · no sign-up</p>

          <h1 className={styles.title}>
            A to Z <span className={styles.gradient}>Computer Science</span>
          </h1>

          <p className={styles.subtitle}>
            One place to learn it all — from your first line of C to transformers, RAG and AI
            agents. Notes, worked examples and practice questions, organised topic by topic,
            with a code cell on every page.
          </p>

          <dl className={styles.figures}>
            <div>
              <dt>{stats.sections}</dt>
              <dd>sections</dd>
            </div>
            <div>
              <dt>{stats.topics}</dt>
              <dd>topics</dd>
            </div>
            <div>
              <dt>{TRACKS.length}</dt>
              <dd>tracks</dd>
            </div>
            <div>
              <dt>{LANGS.length}</dt>
              <dd>languages that run</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} to="/docs">
              Explore topics <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.secondaryBtn} to="/playground">
              Open the Code Lab
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <Globe />
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- tracks */

function TrackCard({ track }: { track: Track }): ReactNode {
  const colour = toneOf(track.tone);
  const shown = track.sections.slice(0, 4);
  const rest = track.sections.length - shown.length;

  return (
    <Link
      to={track.href}
      className={styles.card}
      style={
        {
          '--tone': colour.base,
          '--tone-line': colour.line,
          '--tone-rgb': colour.rgb,
        } as CSSProperties
      }
      data-tone={track.tone}>
      <span className={styles.spotlight} aria-hidden="true" />

      <div className={styles.cardTop}>
        <span className={styles.cardBadge}>{track.badge}</span>
        <span className={styles.cardCount}>
          {track.sectionCount} sections · {track.topics} topics
        </span>
      </div>

      <h3 className={styles.cardTitle}>{track.label}</h3>
      <p className={styles.cardBlurb}>{track.blurb}</p>

      <ul className={styles.chipList}>
        {shown.map((section) => (
          <li key={section.num}>
            <span className={styles.chipNum}>{String(section.num).padStart(2, '0')}</span>
            {section.title}
          </li>
        ))}
        {rest > 0 && <li className={styles.chipMore}>+{rest} more</li>}
      </ul>

      <span className={styles.cardLink}>
        Explore <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function Tracks({ onTone }: { onTone: (tone: string | null) => void }): ReactNode {
  const gridRef = useRef<HTMLDivElement>(null);

  /**
   * One handler for the whole grid: it tints the page with the hovered card's
   * colour and moves that card's spotlight to the cursor.
   */
  const move = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-tone]');
      if (!card) {
        onTone(null);
        return;
      }
      onTone(card.dataset.tone ?? null);
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my', `${e.clientY - rect.top}px`);
    },
    [onTone],
  );

  const out = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const to = e.relatedTarget as Node | null;
      if (!to || !gridRef.current?.contains(to)) onTone(null);
    },
    [onTone],
  );

  return (
    <section className={styles.section} id="tracks">
      <p className={styles.kicker}>01 · Where to start</p>
      <h2 className={styles.sectionTitle}>Choose a track</h2>
      <p className={styles.sectionLead}>
        The syllabus is {stats.sections} sections deep and grouped into {TRACKS.length} tracks.
        Start at the beginning or jump straight to the part you need — every page stands on
        its own.
      </p>

      <div className={styles.grid} ref={gridRef} onMouseMove={move} onMouseOut={out}>
        {TRACKS.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- lab */

const LAB_POINTS = [
  'A practice cell sits under every topic — write code and run it without leaving the page.',
  `Python and JavaScript execute inside your browser. C, C++, Java, Go, Rust, SQL and the rest of the ${LANGS.length} supported languages compile online.`,
  'Open the full Code Lab when you want several cells, your own datasets and a notebook to download.',
];

function Lab(): ReactNode {
  return (
    <section className={styles.section}>
      <p className={styles.kicker}>02 · Learn by running it</p>
      <h2 className={styles.sectionTitle}>Read a page, run the code on it</h2>
      <p className={styles.sectionLead}>
        Reading about a quicksort is not the same as watching one sort your own array. Every
        topic page carries a real runtime.
      </p>

      <div className={styles.labGrid}>
        <ul className={styles.points}>
          {LAB_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
          <li className={styles.pointCta}>
            <Link className={styles.secondaryBtn} to="/playground">
              Open the Code Lab
            </Link>
          </li>
        </ul>

        <div className={styles.labVisual}>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export default function Home(): ReactNode {
  const washRef = useRef<HTMLDivElement>(null);

  /**
   * The wash is painted straight onto the DOM node rather than held in state:
   * hovering a card should tint the page, not re-render it.
   */
  const setWash = useCallback((tone: string | null) => {
    const el = washRef.current;
    if (!el) return;
    if (tone) {
      el.style.setProperty('--wash-rgb', toneOf(tone).rgb);
      el.dataset.on = 'yes';
    } else {
      el.dataset.on = 'no';
    }
  }, []);

  return (
    <Layout
      title="A to Z Computer Science"
      description={`Open learning hub — ${stats.sections} sections and ${stats.topics} topics covering programming fundamentals, DSA, machine learning, deep learning, generative AI and computer vision.`}>
      <div
        ref={washRef}
        className={styles.wash}
        data-on="no"
        style={{ '--wash-rgb': toneOf(undefined).rgb } as CSSProperties}
        aria-hidden="true"
      />
      <Hero />
      <main>
        <Tracks onTone={setWash} />
        <Lab />
      </main>
    </Layout>
  );
}
