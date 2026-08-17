import { useMemo, useState, type ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import AddButton from '@site/src/components/AddButton';
import projectsData from '@site/src/data/projects.json';
import styles from './projects.module.css';

/**
 * Things to build.
 *
 * Reading notes and running snippets only takes you so far; at some point you
 * have to build something that does not have a solution page. This is the
 * shelf you take that from.
 *
 * An entry is deliberately just two things — a topic name and a link — so
 * adding one is never a chore. Everything comes from
 * `src/data/projects.json`, written by `tools/build_projects.py` from the
 * `projects/` folder.
 */

type Project = { name: string; url: string; about: string };

type Group = {
  id: string;
  title: string;
  about: string;
  order: number;
  file: string;
  links: Project[];
};

const GROUPS = projectsData as Group[];
const TOTAL = GROUPS.reduce((n, g) => n + g.links.length, 0);

const TEMPLATE = `---
title: My new group
about: One line describing what kind of projects belong here.
order: 5
---

- [Topic name](https://example.com/)
- [Another topic](https://example.com/) — an optional line on why it is worth building.
`;

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function Projects(): ReactNode {
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      links: g.links.filter((p) => !q || `${p.name} ${p.about} ${p.url}`.toLowerCase().includes(q)),
    })).filter((g) => g.links.length > 0);
  }, [query]);

  const count = shown.reduce((n, g) => n + g.links.length, 0);

  return (
    <Layout
      title="Projects"
      description={`${TOTAL} projects to build — systems, machine learning, web and the idea lists to pull more from.`}>
      <main className={styles.page}>
        <header className={styles.head}>
          <p className={styles.kicker}>What to build</p>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.lead}>
            Notes tell you how something works; a project tells you whether you
            understood. These <b>{TOTAL}</b> are the ones worth the weekend — builds that
            leave you with a compiler, a database, a model or a shipped app, not a
            certificate.
          </p>

          <div className={styles.headActions}>
            <AddButton folder="projects" what="group" template={TEMPLATE} />
            <span className={styles.hint}>
              Or press <b>+</b> on a group to add a project — a topic name and a link is
              the whole entry.
            </span>
          </div>
        </header>

        <div className={styles.controls}>
          <input
            className={styles.search}
            value={query}
            placeholder="Search projects…"
            aria-label="Search projects"
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.count}>{count} shown</span>
        </div>

        {count === 0 && <p className={styles.none}>Nothing matches that.</p>}

        {shown.map((group) => (
          <section key={group.id} className={styles.group}>
            <div className={styles.groupHead}>
              <span className={styles.order}>{String(group.order).padStart(2, '0')}</span>
              <div>
                <h2 className={styles.groupTitle}>{group.title}</h2>
                {group.about && <p className={styles.groupAbout}>{group.about}</p>}
              </div>
              <span className={styles.groupCount}>{group.links.length}</span>
              <AddButton edit={group.file} what={`project to ${group.title}`} compact />
            </div>

            <ul className={styles.grid}>
              {group.links.map((project) => (
                <li key={project.url}>
                  <Link
                    className={styles.card}
                    to={project.url}
                    target="_blank"
                    rel="noopener noreferrer">
                    <span className={styles.cardTop}>
                      <b>{project.name}</b>
                      <span className={styles.go} aria-hidden="true">
                        ↗
                      </span>
                    </span>
                    <small className={styles.host}>{host(project.url)}</small>
                    {project.about && <p className={styles.about}>{project.about}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.footnote}>
          Build the smallest version first and make it work end to end. A finished toy
          teaches more than an abandoned masterpiece, and it is the one you can show
          someone.
        </p>
      </main>
    </Layout>
  );
}
