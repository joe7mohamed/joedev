import { Fragment } from 'react';
import { latinRuns } from '@/lib/latinRuns';

type MixedTextProps = { text: string; locale: string };

/**
 * Text that may hold Latin runs inside Arabic ("البحرين · UTC+3"). On the Arabic page each Latin run is marked
 * `lang="en"`, so it keeps its tracking and is read as English; on the English page the text is left as it is.
 */
export function MixedText({ text, locale }: MixedTextProps) {
  if (locale !== 'ar') return <>{text}</>;
  return (
    <>
      {latinRuns(text).map((run, i) => (
        // runs come from a fixed string and never reorder
        // biome-ignore lint/suspicious/noArrayIndexKey: the position is the run's identity
        <Fragment key={i}>{run.latin ? <span lang="en">{run.text}</span> : run.text}</Fragment>
      ))}
    </>
  );
}
