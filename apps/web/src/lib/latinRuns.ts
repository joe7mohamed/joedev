export type Run = { text: string; latin: boolean };

/** Latin letters, digits and the joiners of addresses, times and offsets; runs may span spaces between words. */
const LATIN_RUN = /[A-Za-z0-9+.:@-]+(?:\s+[A-Za-z0-9+.:@-]+)*/g;
const HAS_LETTER_OR_DIGIT = /[A-Za-z0-9]/;

/**
 * Splits text into Latin runs and the rest, so Latin inside an Arabic string ("UTC+3") can be marked as English.
 * A run of punctuation alone (an Arabic sentence's full stop) stays with the text around it. Joining the runs always
 * gives back the original text.
 */
export const latinRuns = (text: string): Run[] => {
  const runs: Run[] = [];
  let at = 0;
  const push = (part: string, latin: boolean): void => {
    if (!part) return;
    const last = runs[runs.length - 1];
    if (last && last.latin === latin) runs[runs.length - 1] = { text: last.text + part, latin };
    else runs.push({ text: part, latin });
  };
  for (const match of text.matchAll(LATIN_RUN)) {
    const start = match.index ?? 0;
    push(text.slice(at, start), false);
    push(match[0], HAS_LETTER_OR_DIGIT.test(match[0]));
    at = start + match[0].length;
  }
  push(text.slice(at), false);
  return runs;
};
