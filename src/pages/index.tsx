import { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import stats from '@site/src/data/stats.json';
import tracksData from '@site/src/data/tracks.json';
import { LANGS } from '@site/src/lib/runners';
import styles from './index.module.css';

/**
 * The front page.
 *
 * Written the way a university course catalogue is written: a plain statement
 * of what this is, the numbers that describe it, then the syllabus laid out as
 * a set of plates. No gradient, no globe, no motion. A reader should be able to
 * tell within a few seconds what the site contains and where to begin.
 */

type Track = {
  id: string;
  label: string;
  blurb: string;
  badge: string;
  sectionCount: number;
  topics: number;
  href: string;
  sections?: { num: number; title: string; href: string; topics: number }[];
};

const TRACKS = tracksData as Track[];

/* ----------------------------------------------------------------- masthead */

function Masthead(): ReactNode {
  return (
    <header className={styles.masthead}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>An open computer science curriculum</p>

        <h1 className={styles.title}>
          Computer science,
          <br />
          from the first line to the frontier.
        </h1>

        <p className={styles.standfirst}>
          One syllabus that begins where school leaves off and ends at the edge of
          current research. Every topic is a page you can read, a diagram you can
          follow and a program you can run without installing anything. It is
          free, it carries no advertising, and it asks you for nothing.
        </p>

        <div className={styles.actions}>
          <Link className={styles.primary} to="/docs">
            Read the syllabus
          </Link>
          <Link className={styles.secondary} to="/playground">
            Open the Code Lab
          </Link>
        </div>

        <dl className={styles.figures}>
          <div>
            <dt>{stats.sections}</dt>
            <dd>Sections</dd>
          </div>
          <div>
            <dt>{stats.topics.toLocaleString('en-GB')}</dt>
            <dd>Topics</dd>
          </div>
          <div>
            <dt>{TRACKS.length}</dt>
            <dd>Stages</dd>
          </div>
          <div>
            <dt>{LANGS.length}</dt>
            <dd>Languages that run</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------- intent */

function Intent(): ReactNode {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <div className={styles.prose}>
          <h2 className={styles.sectionHead}>Why this exists</h2>
          <p>
            Good teaching is not scarce because it is hard to write. It is scarce
            because it is usually sold. A student who can pay reaches the clear
            explanation, the worked example and someone who will answer the
            question; a student who cannot is left with whatever is free, which is
            rarely the same thing.
          </p>
          <p>
            This site is an attempt to close part of that gap. The whole
            curriculum is here, foundations through to doctoral material, written
            to be understood on a first reading rather than admired on a second.
            Nothing is held back for a paid tier, because there is no paid tier.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- stages */

function TrackPlate({ track }: { track: Track }): ReactNode {
  const all = track.sections ?? [];
  const shown = all.slice(0, 5);
  const rest = all.length - shown.length;

  return (
    <Link to={track.href} className={styles.plate}>
      <span className={styles.plateBadge}>{track.badge}</span>
      <h3 className={styles.plateTitle}>{track.label}</h3>
      <p className={styles.plateBlurb}>{track.blurb}</p>

      <ul className={styles.plateList}>
        {shown.map((s) => (
          <li key={s.num}>{s.title}</li>
        ))}
        {rest > 0 && <li className={styles.plateRest}>and {rest} more</li>}
      </ul>

      <span className={styles.plateFoot}>
        {track.sectionCount} sections &middot;{' '}
        {track.topics.toLocaleString('en-GB')} topics
      </span>
    </Link>
  );
}

function Stages(): ReactNode {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.sectionHead}>The syllabus</h2>
        <p className={styles.sectionLede}>
          Six stages, in the order a student meets them. Each stage holds a set of
          sections; each section breaks into chapters, and each chapter into
          single topics. Begin wherever you honestly are — there is no penalty for
          starting at the beginning.
        </p>

        <div className={styles.plates}>
          {TRACKS.map((t) => (
            <TrackPlate key={t.id} track={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- page shape */

const PAGE_PARTS: { h: string; p: string }[] = [
  {
    h: 'The problem before the definition',
    p: 'Every topic opens with the difficulty that made the idea necessary. A definition learned before its problem is a definition soon forgotten.',
  },
  {
    h: 'Diagrams drawn, not pasted',
    p: 'Figures are drawn in the page itself, so they stay sharp at any size, work in either theme, and never break.',
  },
  {
    h: 'Code that runs where you read it',
    p: 'A cell on the page rather than a link to somewhere else. Edit the example, run it, and carry on reading without losing your place.',
  },
  {
    h: 'Step through what changes',
    p: 'Where something moves — a loop, a pointer, a tree rebalancing — you advance it one step at a time and watch it happen.',
  },
  {
    h: 'The mistakes people actually make',
    p: 'Each page names the errors that get written in practice, not the ones that are easy to list.',
  },
  {
    h: 'Practice, then examinations',
    p: 'Questions with answers you can check, followed by the examination and interview questions that come from that exact topic.',
  },
];

function PageShape(): ReactNode {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <h2 className={styles.sectionHead}>What a page looks like</h2>
        <p className={styles.sectionLede}>
          Every topic is written to the same shape, so that once you have read one
          page you know how to read all of them.
        </p>

        <ol className={styles.parts}>
          {PAGE_PARTS.map((part, i) => (
            <li key={part.h}>
              <span className={styles.partNum}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{part.h}</h3>
                <p>{part.p}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- start */

function Start(): ReactNode {
  return (
    <section className={styles.bandLast}>
      <div className={styles.inner}>
        <div className={styles.prose}>
          <h2 className={styles.sectionHead}>Where to begin</h2>
          <p>
            If you are starting from nothing, begin at Foundation. It assumes no
            programming and no mathematics beyond school. If you are partway
            through a degree, go straight to the section you are stuck on — every
            page stands on its own. If you are looking for research material, the
            later stages are written for you.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/docs">
              Start at the beginning
            </Link>
            <Link className={styles.secondary} to="/playground">
              Try the Code Lab first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Computer science, from the first line to the frontier"
      description="A free and complete computer science curriculum — foundations through to research — with diagrams and runnable code on every page.">
      <Masthead />
      <Intent />
      <Stages />
      <PageShape />
      <Start />
    </Layout>
  );
}
