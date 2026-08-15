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
  /** Folder the new file belongs in, e.g. "resources". */
  folder: string;
  /** What the reader is adding, used in the label and tooltip. */
  what: string;
  /** Optional starter content for the file. */
  template?: string;
};

export default function AddButton({ folder, what, template }: AddButtonProps): ReactNode {
  const url = new URL(`${REPO}/new/main`);
  url.searchParams.set('filename', `${folder}/new-${what.toLowerCase().replace(/\s+/g, '-')}.md`);
  if (template) url.searchParams.set('value', template);

  return (
    <a
      className={styles.add}
      href={url.toString()}
      target="_blank"
      rel="noopener noreferrer"
      title={`Add a ${what} — opens GitHub with a new file in ${folder}/`}>
      <span className={styles.plus} aria-hidden="true">+</span>
      Add {what}
    </a>
  );
}
