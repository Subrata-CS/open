import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import LocalAi from '@site/src/components/LocalAi';
import styles from './styles.module.css';

/**
 * An "Ask AI" drawer that lives on the page itself.
 *
 * Opening it does not navigate anywhere: the page you were reading stays
 * exactly where it was, behind the panel, and Close puts you straight back on
 * it. Back returns to the assistant picker without losing the question.
 *
 * One honest limitation, and it is not ours to fix: ChatGPT, Claude and
 * Perplexity all forbid being embedded in another site (ChatGPT sends
 * `X-Frame-Options: SAMEORIGIN`, Claude sends `frame-ancestors 'self'`), so
 * the final hop to the assistant opens in a new tab. Everything before that —
 * writing the question, framing it with the topic, choosing where to send it —
 * happens right here.
 */

type Assistant = {
  id: string;
  label: string;
  blurb: string;
  colour: string;
  url: (query: string) => string;
};

/** The in-browser model is not a hosted service, so it sits outside this list. */
export const LOCAL_ID = 'local';

export const ASSISTANTS: Assistant[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    blurb: 'Good all-rounder for explanations and code walkthroughs.',
    colour: '#10a37f',
    url: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'claude',
    label: 'Claude',
    blurb: 'Strong on long reasoning, writing and reading code.',
    colour: '#d97757',
    url: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    blurb: 'Answers with live sources you can click through and check.',
    colour: '#20b8cd',
    url: (q) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
  },
];

/** Other code opens the drawer by firing this event. */
export const OPEN_EVENT = 'open-ask-ai';

export default function AiPanel(): ReactNode {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<Assistant | null>(null);
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const { pathname } = useLocation();

  /** Work out what the reader is looking at, so the question carries context. */
  const topicFromPage = useCallback(() => {
    if (typeof document === 'undefined') return '';
    const heading = document.querySelector('article h1')?.textContent?.trim();
    const crumbs = Array.from(
      document.querySelectorAll('.breadcrumbs__link'),
      (el) => el.textContent?.trim() ?? '',
    ).filter(Boolean);
    // breadcrumbs read "11. Database Systems"; the number is noise in a question
    const section = (crumbs.length > 1 ? crumbs[crumbs.length - 2] : '').replace(
      /^\d+\.\s*/,
      '',
    );
    if (!heading) return '';
    return section ? `${heading} (${section}, computer science)` : heading;
  }, []);

  const framed = useCallback(() => {
    const context = topicFromPage();
    const asked = question.trim();
    if (!context) return asked || 'Explain a computer science concept to me';
    return asked ? `${context}: ${asked}` : `Explain ${context}`;
  }, [question, topicFromPage]);

  /* ------------------------------------------------------------ opening */

  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setChosen(ASSISTANTS.find((a) => a.id === id) ?? null);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Close on Escape, and lock the page behind the drawer while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    boxRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Leaving the page closes the drawer.
  useEffect(() => setOpen(false), [pathname]);

  const send = useCallback(
    (assistant: Assistant) => {
      window.open(assistant.url(framed()), '_blank', 'noopener,noreferrer');
    },
    [framed],
  );

  const copy = useCallback(() => {
    void navigator.clipboard?.writeText(framed()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, [framed]);

  if (!open) return null;

  const context = topicFromPage();

  return (
    <div className={styles.shell} role="dialog" aria-modal="true" aria-label="Ask AI">
      <button
        type="button"
        className={styles.scrim}
        aria-label="Close"
        onClick={() => setOpen(false)}
      />

      <section className={styles.panel}>
        <header className={styles.bar}>
          {chosen ? (
            <button
              type="button"
              className={styles.back}
              onClick={() => setChosen(null)}>
              <span aria-hidden="true">←</span> Back
            </button>
          ) : (
            <span className={styles.title}>Ask AI</span>
          )}

          {chosen && <span className={styles.title}>{chosen.label}</span>}

          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label="Close the panel">
            Close <span aria-hidden="true">✕</span>
          </button>
        </header>

        <div className={styles.body}>
          {context && (
            <p className={styles.context}>
              Reading <b>{context}</b> — your question is sent with this context.
            </p>
          )}

          {chosen?.id !== LOCAL_ID && (
            <>
          <label className={styles.label} htmlFor="ask-ai-question">
            Your question
          </label>
          <textarea
            id="ask-ai-question"
            ref={boxRef}
            className={styles.textarea}
            rows={4}
            value={question}
            placeholder="Ask anything — leave it empty for a plain explanation of this topic."
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className={styles.preview}>
            <span className={styles.previewTag}>will be sent as</span>
            {framed()}
          </div>
            </>
          )}

          {chosen?.id === LOCAL_ID ? (
            <LocalAi context={context} />
          ) : chosen ? (
            <>
              <button
                type="button"
                className={styles.go}
                style={{ background: chosen.colour }}
                onClick={() => send(chosen)}>
                Open {chosen.label} <span aria-hidden="true">↗</span>
              </button>
              <p className={styles.why}>
                {chosen.label} does not allow other sites to embed it, so it opens
                in a new tab. This page stays open behind it — come straight back
                when you are done.
              </p>
            </>
          ) : (
            <ul className={styles.list}>
              <li>
                <button
                  type="button"
                  className={`${styles.pick} ${styles.pickLocal}`}
                  onClick={() =>
                    setChosen({
                      id: LOCAL_ID,
                      label: 'this browser',
                      blurb: '',
                      colour: '#818cf8',
                      url: () => '',
                    })
                  }>
                  <span className={styles.swatch} style={{ background: '#818cf8' }} />
                  <span className={styles.pickText}>
                    <b>Answer on this page — free</b>
                    <small>
                      The only one that can reply without leaving the site: a small
                      model running on your own machine. No account, no cost, private,
                      works offline. Needs Chrome or Edge on a computer.
                    </small>
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              </li>

              <li className={styles.aside}>
                The three below are hosted services. They forbid other sites from
                embedding them, so they open in a new tab with your question already
                filled in — this page stays open behind them.
              </li>

              {ASSISTANTS.map((assistant) => (
                <li key={assistant.id}>
                  <button
                    type="button"
                    className={styles.pick}
                    onClick={() => setChosen(assistant)}>
                    <span
                      className={styles.swatch}
                      style={{ background: assistant.colour }}
                    />
                    <span className={styles.pickText}>
                      <b>{assistant.label}</b>
                      <small>{assistant.blurb}</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {chosen?.id !== LOCAL_ID && (
            <button type="button" className={styles.copy} onClick={copy}>
              {copied ? 'Copied' : 'Copy the question instead'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
