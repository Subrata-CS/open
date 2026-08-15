import { useCallback, useState, type ReactNode } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/**
 * A question box for readers who want to check something or go deeper.
 *
 * The site is static, so there is no chatbot behind this — and that is
 * deliberate: an API key shipped to the browser would be public. Instead the
 * box hands the question, already framed with the topic and section, to
 * whichever tool the reader prefers. Nothing is sent anywhere until they
 * choose one, and no key, account or tracking is involved.
 */

export type AskBoxProps = {
  /** Topic name, used to frame the question. */
  topic: string;
  /** Section the topic belongs to, for extra context. */
  section?: string;
};

type Destination = {
  id: string;
  label: string;
  url: (query: string) => string;
};

const DESTINATIONS: Destination[] = [
  {
    id: 'google',
    label: 'Google',
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'claude',
    label: 'Claude',
    url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
  },
];

export default function AskBox({ topic, section }: AskBoxProps): ReactNode {
  const [question, setQuestion] = useState('');
  const searchBase = useBaseUrl('/search');

  /** Frame the question so the answer lands on the right subject. */
  const framed = useCallback(() => {
    const context = section ? `${topic} (${section}, computer science)` : topic;
    return question.trim() ? `${context}: ${question.trim()}` : `Explain ${context}`;
  }, [question, section, topic]);

  const open = useCallback(
    (destination: Destination) => {
      window.open(destination.url(framed()), '_blank', 'noopener,noreferrer');
    },
    [framed],
  );

  const searchSite = useCallback(() => {
    const q = question.trim() || topic;
    window.location.href = `${searchBase}?q=${encodeURIComponent(q)}`;
  }, [question, searchBase, topic]);

  return (
    <aside className={styles.box}>
      <p className={styles.head}>
        <span className={styles.dot} />
        Still have a question about <b>{topic}</b>?
      </p>

      <div className={styles.row}>
        <input
          className={styles.input}
          value={question}
          placeholder={`e.g. why is ${topic.toLowerCase()} used?`}
          aria-label={`Your question about ${topic}`}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') open(DESTINATIONS[0]);
          }}
        />
        <button type="button" className={styles.site} onClick={searchSite}>
          Search this site
        </button>
      </div>

      <div className={styles.row}>
        <span className={styles.ask}>Ask</span>
        {DESTINATIONS.map((destination) => (
          <button
            key={destination.id}
            type="button"
            className={styles.dest}
            onClick={() => open(destination)}>
            {destination.label} <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      <p className={styles.note}>
        Your question opens in a new tab with the topic already filled in. Answers
        from any assistant can be wrong — check them against the notes above.
      </p>
    </aside>
  );
}
