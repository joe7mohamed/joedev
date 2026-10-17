import type { HomeContent } from '@zakydev/shared';
import { plain } from '@zakydev/shared/text';
import { icons } from '@/components/icons';
import { BuildScene } from './BuildScene';
import { ProcessScene } from './ProcessScene';
import { StepTools } from './StepTools';

type ProcessProps = { content: HomeContent['process'] };

/**
 * The process scene's server half: the parts that never change (the build drawing, the tool lists, the ticks) are
 * rendered here and handed to the scene (ProcessScene), so their markup stays out of the page's scripts.
 */
export function Process({ content }: ProcessProps) {
  return (
    <ProcessScene
      content={content}
      drawing={<BuildScene live={plain(content.live)} />}
      tools={content.steps.map((step) => <StepTools key={step.name} tools={step.tools} />)}
      check={<icons.CheckCircle />}
      tick={<icons.Tick />}
    />
  );
}
