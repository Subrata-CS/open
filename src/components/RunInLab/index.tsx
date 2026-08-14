import { useCallback, type ReactNode } from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import CodeBlock from '@theme/CodeBlock';
import { langById, type LangId } from '@site/src/lib/runners';
import { sendToLab } from '@site/src/lib/handoff';
import styles from './styles.module.css';

export type RunInLabProps = {
  /** Topic name — shown in the Code Lab so the reader knows where they came from. */
  topic: string;
  /** Language the practice cell should open in. */
  lang?: LangId;
  /** Optional snippet to carry across. Leave empty for a blank cell. */
  code?: string;
};

/**
 * Sits under a "Run your code" heading on a topic page.
 * One click opens the Code Lab with this snippet loaded, and the Lab
 * shows a link back to exactly this page.
 */
export default function RunInLab({ topic, lang = 'python', code }: RunInLabProps): ReactNode {
  const history = useHistory();
  const { pathname } = useLocation();

  const go = useCallback(() => {
    sendToLab({
      code,
      lang,
      topic,
      returnUrl: pathname,
      returnTitle: topic,
    });
    history.push('/playground');
  }, [code, history, lang, pathname, topic]);

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.dot} />
        <span className={styles.label}>Practice</span>
      </div>

      {code && <CodeBlock language={langById(lang).prism}>{code}</CodeBlock>}

      <p className={styles.note}>
        {code
          ? 'Open this snippet in the Code Lab — edit it, run it, add your own cells. A link back to this page waits for you there.'
          : 'Open the Code Lab with a fresh cell for this topic. Write anything you like, run it, and come straight back when you are done.'}
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={go}>
          Try it yourself <span aria-hidden="true">→</span>
        </button>
        <span className={styles.where}>opens the Code Lab in this tab</span>
      </div>
    </div>
  );
}
