import { type HomeContent, plain } from '@zakydev/shared';
import Image from 'next/image';
import { type CSSProperties, Fragment } from 'react';
import { icons } from '@/components/icons';
import { ToolChip } from '@/components/ToolChip';
import { Swap } from '@/motion/Swap';
import { Diagram } from './diagrams';
import { SHOT } from './screenshot';
import { VisitLink } from './VisitLink';

export type Project = HomeContent['projects'][number];

type ProjectTextProps = {
  project: Project;
  visit: string;
  /** The project in view; in the stacked layout simply the first one. */
  current: boolean;
  /** Enhanced and not in view: out of sight and out of the accessibility tree. */
  hidden: boolean;
  /** The first screenshot is preloaded: the hero zoom reveals it (spec 6.2). */
  preload: boolean;
};

const META_ICONS = [icons.Calendar, icons.Tag, icons.Box];

/** Position in the settle-in stagger (work.css). */
const step = (i: number): CSSProperties => ({ '--i': i }) as CSSProperties;

/**
 * One project as a complete article. In the stacked layout every project shows this in full. In enhanced mode only
 * the current one shows: its name flips through `Swap`, and everything else is keyed by the project, so a new
 * project remounts it and replays the settle-in animation, which only ever fills backwards and so always ends on
 * the visible resting style.
 */
export function ProjectText({ project, visit, current, hidden, preload }: ProjectTextProps) {
  return (
    <article
      data-project-text
      data-current={current || undefined}
      inert={hidden || undefined}
      aria-hidden={hidden || undefined}
    >
      <h3 data-name>
        <Swap value={project.name} />
      </h3>
      <Fragment key={project.id}>
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
          <Diagram kind={project.diagram} labels={project.diagramLabels} />
          <figcaption>{project.caption}</figcaption>
        </figure>
        <ul data-tools data-settle dir="ltr" style={step(6)}>
          {project.tools.map((tool) => (
            <ToolChip key={tool} name={tool} />
          ))}
        </ul>
        <VisitLink href={project.url} label={visit} style={step(7)} />
        <figure data-shot>
          <Image src={project.image} alt={project.imageAlt} {...SHOT} preload={preload} />
        </figure>
      </Fragment>
    </article>
  );
}
