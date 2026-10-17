import { plain } from '@zakydev/shared/text';
import type { CSSProperties } from 'react';
import { icons } from '@/components/icons';
import { ToolChip } from '@/components/ToolChip';
import { Diagram } from './diagrams';
import type { Project } from './ProjectText';
import { VisitLink } from './VisitLink';

const META_ICONS = [icons.Calendar, icons.Tag, icons.Box];

/** Position in the settle-in stagger (work.css). */
const step = (i: number): CSSProperties => ({ '--i': i }) as CSSProperties;

/**
 * Everything of a project's article below its name, rendered on the server: it never changes, so its markup, the
 * drawings, icons and tool logos stay out of the page's scripts (spec line 32). ProjectText places it.
 */
export function ProjectBody({ project, visit }: { project: Project; visit: string }) {
  return (
    <>
      <p data-category data-settle style={step(0)}>
        {project.category}
      </p>
      <p data-summary data-settle style={step(1)}>
        {project.description}
      </p>
      <ul data-meta>
        {project.meta.map((item, i) => {
          const Icon = META_ICONS[i] ?? icons.Box;
          return (
            <li key={plain(item)} data-settle style={step(2 + i)}>
              <Icon />
              <span>{plain(item)}</span>
            </li>
          );
        })}
      </ul>
      <figure data-diagram data-settle style={step(5)}>
        <Diagram project={project} />
        <figcaption>{project.caption}</figcaption>
      </figure>
      <ul data-tools data-settle dir="ltr" style={step(6)}>
        {project.tools.map((tool) => (
          <ToolChip key={tool} name={tool} />
        ))}
      </ul>
      <VisitLink href={project.url} label={visit} style={step(7)} />
    </>
  );
}
