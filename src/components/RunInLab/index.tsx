import { useCallback, useState, type ReactNode } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import CodeBlock from '@theme/CodeBlock';
import InlineLab from '@site/src/components/InlineLab';
import { langById, type LangId } from '@site/src/lib/runners';
import { sendToLab } from '@site/src/lib/handoff';
import styles from './styles.module.css';

export type RunInLabProps = {
  /** Topic name — shown in the Code Lab so the reader knows where they came from. */
  topic: string;
  /** Language the practice cell should open in. */
  lang?: LangId;
  /** Optional snippet to start from. Leave empty for a blank cell. */
  code?: string;
};

/**
 * Sits under a "Run your code" heading on a topic page.
 *
 * "Try it yourself" opens a real, runnable cell **on this page** — write, run,
 * read the output, close it and keep reading. Nothing is lost, nothing loads.
 * The full Code Lab sits right beside it for longer sessions, and carries the
 * snippet across with a link back to this exact page.
 */
export default function RunInLab({ topic, lang = 'python', code }: RunInLabProps): ReactNode {
  const history = useHistory();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const toLab = useCallback(
    (labLang: LangId, labCode?: string) => {
      sendToLab({
        code: labCode,
        lang: labLang,
        topic,
        returnUrl: pathname,
        returnTitle: topic,
      });
      history.push('/playground');
    },
    [history, pathname, topic],
  );

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.dot} />
        <span className={styles.label}>Practice</span>
        <span className={styles.lang}>{langById(lang).label}</span>
      </div>

      {code && !open && <CodeBlock language={langById(lang).prism}>{code}</CodeBlock>}

      {!open && (
        <p className={styles.note}>
          Run code for this topic right here on the page — no new tab, no waiting. Open the
          cell, try something, close it and carry on reading.
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide the cell' : 'Try it yourself'} <span aria-hidden="true">{open ? '▴' : '→'}</span>
        </button>

        {!open && (
          <button type="button" className={styles.secondary} onClick={() => toLab(lang, code)}>
            Open the Code Lab <span aria-hidden="true">↗</span>
          </button>
        )}

        <span className={styles.where}>
          {open
            ? 'runs on this page — close it and carry on reading'
            : 'the Lab keeps a link back here'}
        </span>
      </div>

      {open && (
        <InlineLab
          topic={topic}
          lang={lang}
          code={code}
          onClose={() => setOpen(false)}
          onExpand={toLab}
        />
      )}
    </div>
  );
}
