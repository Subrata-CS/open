import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
    blurb: 'Computer basics, programming fundamentals, discrete math, linear algebra, probability, calculus.',
    badge: '01 – 06',
  },
  {
    label: 'Core CS',
    to: '/docs/data-structures-and-algorithms',
    blurb: 'DSA, computer architecture, operating systems, networks, databases, software engineering.',
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
    blurb: 'Data science, ML, deep learning, NLP, computer vision, LLMs, RAG, AI agents, MLOps.',
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
    blurb: 'Literature review, problem framing, experiment design, paper writing, XAI, federated learning.',
    badge: '39 – 40',
  },
];

function Hero(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>Open source · MIT licensed · Free forever</p>
        <h1 className={styles.title}>
          A to Z <span className={styles.gradient}>Computer Science</span>
        </h1>
        <p className={styles.subtitle}>{siteConfig.tagline}</p>

        <div className={styles.actions}>
          <Link className={styles.primaryBtn} to="/docs">
            Start learning →
          </Link>
          <Link className={styles.secondaryBtn} to="https://github.com/Subrata-CS/open">
            View on GitHub
          </Link>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>{stats.sections}</dt>
            <dd>Sections</dd>
          </div>
          <div className={styles.stat}>
            <dt>{stats.topics}</dt>
            <dd>Topics</dd>
          </div>
          <div className={styles.stat}>
            <dt>∞</dt>
            <dd>Cost</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

function Tracks(): ReactNode {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Choose a track</h2>
      <p className={styles.sectionLead}>
        Puro syllabus ta 40 ta section e vaga — jekono jayga theke shuru korte paro.
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

function HowItWorks(): ReactNode {
  const steps = [
    {
      n: '1',
      t: 'Edit Markdown',
      d: 'Repo te kono .md file edit koro — GitHub web editor tei hobe, local setup lagbe na.',
    },
    {
      n: '2',
      t: 'Commit',
      d: 'Commit korar sathe sathe GitHub Actions workflow nijei chalu hoye jay.',
    },
    {
      n: '3',
      t: 'Live in ~2 min',
      d: 'Site rebuild hoye GitHub Pages e deploy hoy. Sidebar, search, TOC — sob auto update.',
    },
  ];
  return (
    <section className={styles.sectionAlt}>
      <h2 className={styles.sectionTitle}>Backend edit → frontend live</h2>
      <p className={styles.sectionLead}>
        Kono manual deploy nei, kono config file edit korte hobe na.
      </p>
      <div className={styles.steps}>
        {steps.map((s) => (
          <div key={s.n} className={styles.step}>
            <span className={styles.stepNum}>{s.n}</span>
            <h3 className={styles.cardTitle}>{s.t}</h3>
            <p className={styles.cardBlurb}>{s.d}</p>
          </div>
        ))}
      </div>
      <p className={styles.credit}>
        Prepared by <strong>Subrata Pramanik</strong>
      </p>
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
        <HowItWorks />
      </main>
    </Layout>
  );
}
