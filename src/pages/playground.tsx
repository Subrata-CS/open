import { useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import CodeLab, { type LessonCell } from '@site/src/components/CodeLab';
import type { LangId } from '@site/src/lib/runners';
import lessons from '@site/src/data/lessons.json';
import styles from './playground.module.css';

type Topic = {
  id: string;
  label: string;
  lang: LangId;
  lesson: LessonCell[];
};

const TOPICS = lessons as Topic[];

export default function Playground(): ReactNode {
  const [active, setActive] = useState(0);
  const topic = TOPICS[active];

  return (
    <Layout
      title="Code Lab"
      description="Read the lesson on the left, write and run your own code on the right — Python, C, C++, Java, Go, SQL and more, straight in the browser.">
      <div className={styles.page}>
        <div className={styles.head}>
          <p className={styles.kicker}>Interactive</p>
          <h1 className={styles.title}>Code Lab</h1>
          <p className={styles.lead}>
            Worked examples on the left, your own notebook on the right. Add cells, switch
            language per cell, upload a dataset, run everything, download your work. Write
            whatever you like — this is a real interpreter, not a fixed set of exercises.
            Python and JavaScript execute inside your browser; C, C++, Java, Go, Rust, SQL
            and the rest are compiled for you.
          </p>

          <div className={styles.topics}>
            {TOPICS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={i === active ? styles.topicActive : styles.topic}
                onClick={() => setActive(i)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <CodeLab
          key={topic.id}
          title={topic.label}
          lesson={topic.lesson}
          defaultLang={topic.lang}
          filename={`open-${topic.id}`}
        />

        <p className={styles.footnote}>
          Every output shown on the left was produced by running that exact snippet. The first
          Python run downloads the runtime once, then it stays warm; packages such as NumPy and
          scikit-learn are fetched only when your code imports them.
        </p>
      </div>
    </Layout>
  );
}
