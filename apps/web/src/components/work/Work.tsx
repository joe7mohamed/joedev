import type { HomeContent } from '@zakydev/shared';
import { ProjectBody } from './ProjectBody';
import type { Project } from './ProjectText';
import { preloadShot, shotOf } from './screenshot';
import { WorkScene } from './WorkScene';

type WorkProps = { work: HomeContent['work']; projects: Project[] };

/**
 * The work scene's server half: each project's unchanging article body and its screenshot's attributes, handed to
 * the scene (WorkScene), which only decides what shows. The first screenshot is the one the hero zoom reveals
 * (spec 6.2): eager and preloaded.
 */
export function Work({ work, projects }: WorkProps) {
  const shots = projects.map((p, i) => shotOf(p.image, p.imageAlt, i === 0));
  if (shots[0]) preloadShot(shots[0]);
  const bodies = projects.map((p) => <ProjectBody key={p.id} project={p} visit={work.visit} />);
  return <WorkScene work={work} projects={projects} bodies={bodies} shots={shots} />;
}
