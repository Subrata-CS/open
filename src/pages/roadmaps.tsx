import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import AddButton from '@site/src/components/AddButton';
import Link from '@docusaurus/Link';
import sectionsData from '@site/src/data/sections.json';
import stats from '@site/src/data/stats.json';
import { PROGRESS_EVENT, isDone } from '@site/src/lib/progress';
import { toneOf } from '@site/src/lib/tones';
import { useEffect } from 'react';
import styles from './roadmaps.module.css';

/**
 * Career roadmaps — an order to read the syllabus in.
 *
 * A roadmap is nothing more than a list of section numbers, so each one is a
 * few lines below rather than a page of its own. The titles, topic counts and
 * links are all looked up from the generated section data, which means adding
 * a section to the syllabus updates every roadmap that includes it.
 */

type Section = {
  num: number;
  title: string;
  href: string;
  topics: number;
  track: string;
  tone: string;
};

const SECTIONS = sectionsData as Section[];
const byNum = new Map(SECTIONS.map((s) => [s.num, s]));

type Roadmap = {
  id: string;
  role: string;
  blurb: string;
  months: string;
  tone: string;
  path: number[];
};

const ROADMAPS: Roadmap[] = [
  { id: 'swe', role: 'Software Engineer', tone: 'indigo', months: '8–12 months',
    blurb: 'The general-purpose path: write code well, understand the machine under it, and ship.',
    path: [1, 2, 7, 8, 9, 12, 13, 11, 14, 16] },
  { id: 'backend', role: 'Backend Engineer', tone: 'cyan', months: '8–10 months',
    blurb: 'Servers, data and the network between them. The half of the web nobody sees.',
    path: [2, 7, 9, 10, 11, 12, 13, 16, 20] },
  { id: 'frontend', role: 'Frontend Engineer', tone: 'violet', months: '6–9 months',
    blurb: 'Everything the reader touches, plus enough computer science to keep it fast.',
    path: [2, 7, 10, 14, 13, 12, 23, 22] },
  { id: 'ml', role: 'Machine Learning Engineer', tone: 'green', months: '10–14 months',
    blurb: 'Mathematics first, then models, then the engineering that keeps them running.',
    path: [2, 4, 5, 6, 7, 26, 30, 31, 34] },
  { id: 'ai-research', role: 'AI Researcher', tone: 'green', months: '14–20 months',
    blurb: 'The path toward reading papers, running experiments and publishing your own.',
    path: [3, 4, 5, 6, 7, 30, 31, 32, 33, 39, 40] },
  { id: 'data', role: 'Data Scientist', tone: 'green', months: '8–12 months',
    blurb: 'Statistics with a keyboard: get the data, ask it something, defend the answer.',
    path: [2, 4, 5, 26, 27, 28, 11, 30] },
  { id: 'devops', role: 'DevOps / SRE', tone: 'cyan', months: '7–10 months',
    blurb: 'Everything between "it works on my machine" and "it works for everyone".',
    path: [2, 9, 10, 13, 16, 17, 20, 12] },
  { id: 'security', role: 'Security Engineer', tone: 'pink', months: '9–12 months',
    blurb: 'You cannot defend a system you do not understand — so learn the system first.',
    path: [1, 2, 3, 9, 10, 17, 11, 35] },
  { id: 'mobile', role: 'Mobile Developer', tone: 'violet', months: '6–9 months',
    blurb: 'Small screens, tight memory, unreliable networks. Constraints make it interesting.',
    path: [2, 7, 15, 10, 11, 14, 16] },
  { id: 'systems', role: 'Systems Programmer', tone: 'amber', months: '10–14 months',
    blurb: 'Close to the metal: memory, scheduling, compilers and the cost of every instruction.',
    path: [1, 2, 7, 8, 9, 18, 21, 24] },
  { id: 'gamedev', role: 'Game Developer', tone: 'amber', months: '9–12 months',
    blurb: 'Real-time graphics with a physics budget of sixteen milliseconds per frame.',
    path: [2, 4, 7, 8, 22, 21, 25, 37] },
  { id: 'quant', role: 'Quantitative Developer', tone: 'teal', months: '10–14 months',
    blurb: 'Probability and low latency in the same job description.',
    path: [4, 5, 6, 7, 26, 30, 21, 24] },
  { id: 'gate', role: 'GATE / Exam Preparation', tone: 'rose', months: '6–10 months',
    blurb: 'The classical syllabus, in the order the exams actually assume you learned it.',
    path: [3, 7, 8, 9, 10, 11, 18, 19] },
  { id: 'phd', role: 'PhD Applicant', tone: 'pink', months: '12–18 months',
    blurb: 'Depth in one area, literacy across the rest, and the ability to write it down.',
    path: [3, 4, 5, 7, 19, 30, 31, 39, 40] },
  { id: 'fullstack', role: 'Full-Stack Developer', tone: 'indigo', months: '9–12 months',
    blurb: 'Both ends of the request, and the confidence to debug either one.',
    path: [2, 7, 11, 14, 13, 10, 16, 12] },
];

export default function Roadmaps(): ReactNode {
  const [open, setOpen] = useState(ROADMAPS[0].id);
  const [, setTick] = useState(0);

  // Progress lives in the browser, so redraw when it changes.
  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(PROGRESS_EVENT, refresh);
  }, []);

  const active = ROADMAPS.find((r) => r.id === open) ?? ROADMAPS[0];

  const steps = useMemo(
    () => active.path.map((n) => byNum.get(n)).filter(Boolean) as Section[],
    [active],
  );

  const totalTopics = steps.reduce((n, s) => n + s.topics, 0);

  return (
    <Layout
      title="Roadmaps"
      description={`${ROADMAPS.length} career roadmaps through the ${stats.sections}-section syllabus.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>Where to go</p>
          <h1 className={styles.title}>Roadmaps</h1>
          <p className={styles.lead}>
            The syllabus is {stats.sections} sections. A roadmap is one route through it,
            in the order the job actually needs. Pick a destination — every step links
            straight into the notes, and ticks itself off as you read.
          </p>

          <div className={styles.headActions}>
            <AddButton edit="src/pages/roadmaps.tsx" what="roadmap" />
          </div>
        </header>

        <div className={styles.split}>
          <nav className={styles.picker} aria-label="Roadmaps">
            {ROADMAPS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={r.id === open ? `${styles.pick} ${styles.on}` : styles.pick}
                style={{ '--tone': toneOf(r.tone).base } as CSSProperties}
                onClick={() => setOpen(r.id)}>
                <b>{r.role}</b>
                <small>{r.path.length} sections · {r.months}</small>
              </button>
            ))}
          </nav>

          <section
            className={styles.detail}
            style={{ '--tone': toneOf(active.tone).base } as CSSProperties}>
            <h2 className={styles.role}>{active.role}</h2>
            <p className={styles.blurb}>{active.blurb}</p>
            <p className={styles.meta}>
              {steps.length} sections · {totalTopics} topics · about {active.months} at a
              steady pace
            </p>

            <ol className={styles.steps}>
              {steps.map((s, i) => {
                const done = isDone(s.href);
                return (
                  <li key={s.num}>
                    <Link
                      className={done ? `${styles.step} ${styles.stepDone}` : styles.step}
                      to={s.href}>
                      <span className={styles.stepNum}>{i + 1}</span>
                      <span className={styles.stepBody}>
                        <b>{s.title}</b>
                        <small>
                          section {String(s.num).padStart(2, '0')} · {s.topics} topics ·{' '}
                          {s.track}
                        </small>
                      </span>
                      <span className={styles.stepGo} aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </main>
    </Layout>
  );
}
