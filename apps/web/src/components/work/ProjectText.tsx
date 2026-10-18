import type { HomeContent } from '@zakydev/shared';
import type { ReactNode } from 'react';
import { Swap } from '@/motion/Swap';
import { ShotPicture } from './ShotPicture';
import type { Shot } from './screenshot';

export type Project = HomeContent['projects'][number];

type ProjectTextProps = {
  project: Project;
  /** Its place in the scene (0-based), which the scene's hidden-item handling reads (useHiddenItems). */
  index: number;
  /** Everything below the name, rendered on the server (ProjectBody). */
  body: ReactNode;
  /** The article's screenshot, with the project's description of it as alt text. */
  shot: Shot;
  /** The project in view; in the stacked layout simply the first one. */
  current: boolean;
  /** The first screenshot is preloaded: the hero zoom reveals it (spec 6.2). */
  preload: boolean;
  /** Hydrated and the page is stacked (reduced motion, or a scene too tall to pin): the screenshot shows here. */
  stacked: boolean;
};

/**
 * The article's own screenshot, for the stacked page; the pinned scene shows it in the gold frame instead. The first
 * one is always rendered (it is preloaded for the hero zoom anyway). The others would otherwise load with the page,
 * because the stacked layout before hydration puts them within the browser's lazy-load distance: they render inside
 * `<noscript>` for the page without script, and on the client only once the page is known to be stacked.
 */
function StackedShot({ shot, preload, stacked }: Pick<ProjectTextProps, 'shot' | 'preload' | 'stacked'>) {
  const image = <ShotPicture shot={shot} alt={shot.img.alt} />;
  return (
    <figure data-shot>
      {preload ? (
        image
      ) : (
        <>
          <noscript>{image}</noscript>
          {stacked ? image : null}
        </>
      )}
    </figure>
  );
}

/**
 * One project as a complete article. In the stacked layout every project shows this in full. In enhanced mode only
 * the current one shows: its name flips through `Swap`, and everything else is keyed by the project, so a new
 * project remounts it and replays the settle-in animation, which only ever fills backwards and so always ends on
 * the visible resting style. The others stay in the accessibility tree by name, out of sight, with their bodies
 * waiting to be found (`data-item-body`, useHiddenItems). The article takes focus only from script (tabIndex -1), so
 * focusing it can bring it into view without adding a tab stop.
 */
export function ProjectText({ project, index, body, shot, current, preload, stacked }: ProjectTextProps) {
  return (
    <article data-project-text data-item data-index={index} data-current={current || undefined} tabIndex={-1}>
      <h3 data-name lang="en">
        <Swap value={project.name} />
      </h3>
      <div key={project.id} data-item-body>
        {body}
        <StackedShot shot={shot} preload={preload} stacked={stacked} />
      </div>
    </article>
  );
}
