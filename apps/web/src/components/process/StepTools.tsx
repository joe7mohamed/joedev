import type { CSSProperties } from 'react';
import { ToolChip } from '@/components/ToolChip';

/** Position in the settle-in stagger (home.css); third after the sentence and what the client gets (StepText). */
const SETTLE: CSSProperties = { '--i': 2 } as CSSProperties;

/**
 * From step 3 on, the step's tools with their logos. Rendered on the server and handed to StepText, so the tool
 * logo map stays out of the page's scripts (spec line 32).
 */
export function StepTools({ tools }: { tools: string[] }) {
  if (tools.length === 0) return null;
  return (
    <ul data-step-tools data-settle dir="ltr" style={SETTLE}>
      {tools.map((tool) => (
        <ToolChip key={tool} name={tool} />
      ))}
    </ul>
  );
}
