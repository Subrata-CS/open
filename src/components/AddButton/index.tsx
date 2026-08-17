import type { ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * A "+" that opens GitHub's new-file editor in the right folder.
 *
 * The whole point of the Markdown pipelines is that adding content is one
 * file. This closes the loop: press +, GitHub opens with an empty file already
 * in the correct directory, write the Markdown, commit — the site rebuilds
 * itself. No clone, no terminal, works from a phone.
 *
 * Anyone may press it; GitHub is what decides who can actually commit, so
 * this is safe to show to every reader. For a visitor it opens a fork-and-
 * pull-request flow, which is exactly how a contribution should arrive.
 */

const REPO = 'https://github.com/Subrata-CS/open';

export type AddButtonProps = {
  /** Folder a new file belongs in, e.g. "resources". */
  folder?: string;
  /**
   * Path of an existing file to open in GitHub's editor instead. Use this
   * where the content lives in one source file rather than a folder.
   */
  edit?: string;
  /** What the reader is adding, used in the label and tooltip. */
  what: string;
  /** Optional starter content for a new file. */
  template?: string;
  /**
   * Render as a small circular "+" with no label. Used on group headings,
   * where the heading itself already says what is being added to.
   */
  compact?: boolean;
};

export default function AddButton({ folder, edit, what, template, compact }: AddButtonProps): ReactNode {
  const url = edit
    ? new URL(`${REPO}/edit/main/${edit}`)
    : new URL(`${REPO}/new/main`);

  if (!edit) {
    url.searchParams.set(
      'filename',
      `${folder}/new-${what.toLowerCase().replace(/\s+/g, '-')}.md`,
    );
    if (template) url.searchParams.set('value', template);
  }

  const title = edit
    ? `Add a ${what} — opens ${edit} in GitHub's editor`
    : `Add a ${what} — opens GitHub with a new file in ${folder}/`;

  if (compact) {
    return (
      <a
        className={styles.compact}
        href={url.toString()}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        aria-label={`Add a ${what}`}>
        <span aria-hidden="true">+</span>
      </a>
    );
  }

  return (
    <a
      className={styles.add}
      href={url.toString()}
      target="_blank"
      rel="noopener noreferrer"
      title={title}>
      <span className={styles.plus} aria-hidden="true">+</span>
      Add {what}
    </a>
  );
}
