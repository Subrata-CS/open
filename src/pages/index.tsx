import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import HeroVisual from '@site/src/components/HeroVisual';
import stats from '@site/src/data/stats.json';
import styles from './index.module.css';

type Track = {
  label: string;
  to: string;
  blurb: string;
  badge: string;
};

const TRACKS: Track[] = [
  {
    label: 'Foundations',
    to: '/docs/computer-fundamentals',
    blurb:
      'Computer basics, programming fundamentals, discrete math, linear algebra, probability, calculus.',
    badge: '01 – 06',
  },
  {
    label: 'Core CS',
    to: '/docs/data-structures-and-algorithms',
    blurb:
      'DSA, computer architecture, operating systems, networks, databases, software engineering.',
    badge: '07 – 12',
  },
  {
    label: 'Engineering',
    to: '/docs/web-development',
    blurb: 'Git, web, mobile, cloud, cybersecurity, compilers, distributed systems, DevOps.',
    badge: '13 – 25',
  },
  {
    label: 'AI & Data',
    to: '/docs/machine-learning',
    blurb:
      'Data science, ML, deep learning, NLP, computer vision, LLMs, RAG, AI agents, MLOps.',
    badge: '26 – 34',
  },
  {
    label: 'Frontier',
    to: '/docs/blockchain',
    blurb: 'Blockchain, IoT, robotics, quantum computing — the systems being built right now.',
    badge: '35 – 38',
  },
  {
    label: 'Research',
    to: '/docs/research-methodology',
    blurb:
      'Literature review, problem framing, experiment design, paper writing, XAI, federated learning.',
    badge: '39 – 40',
  },
];

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>// Open source · MIT licensed · Free forever</span>

          <h1 className={styles.title}>
            A to Z <span className={styles.gradient}>Computer Science</span>
          </h1>

          <p className={styles.subtitle}>
            One place to learn it all — from your first line of C to transformers, RAG and AI
            agents. Notes, examples and practice questions, organised topic by topic.
          </p>

          <div className={styles.chips}>
            <span className={styles.chip}>
              <b>{stats.sections}</b> sections
            </span>
            <span className={styles.chip}>
              <b>{stats.topics}</b> topics
            </span>
            <span className={styles.chip}>Always free</span>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} to="/docs">
              Explore topics <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.secondaryBtn} to="https://github.com/Subrata-CS/open">
              View on GitHub
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <HeroVisual />
        </div>
      </div>
    </header>
  );
}

function Tracks(): ReactNode {
  return (
    <section className={styles.section}>
      <p className={styles.kicker}>01 · Where to start</p>
      <h2 className={styles.sectionTitle}>Choose a track</h2>
      <p className={styles.sectionLead}>
        The full syllabus is split into {stats.sections} sections — start wherever you like.
      </p>

      <div className={styles.grid}>
        {TRACKS.map((track) => (
          <Link key={track.label} to={track.to} className={styles.card}>
            <span className={styles.cardBadge}>{track.badge}</span>
            <h3 className={styles.cardTitle}>{track.label}</h3>
            <p className={styles.cardBlurb}>{track.blurb}</p>
            <span className={styles.cardLink}>Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="A to Z Computer Science"
      description="Open learning hub — 40 sections covering programming fundamentals, DSA, ML, deep learning, generative AI and computer vision.">
      <Hero />
      <main>
        <Tracks />
      </main>
    </Layout>
  );
}
