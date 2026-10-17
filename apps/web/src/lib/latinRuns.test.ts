import { describe, expect, it } from 'vitest';
import { latinRuns } from './latinRuns';

describe('latinRuns', () => {
  it('marks a Latin run inside Arabic text', () => {
    expect(latinRuns('البحرين · UTC+3')).toEqual([
      { text: 'البحرين · ', latin: false },
      { text: 'UTC+3', latin: true },
    ]);
  });
  it('keeps Latin words separated by spaces in one run', () => {
    expect(latinRuns('حلبة Bahrain International منذ 2019.')).toEqual([
      { text: 'حلبة ', latin: false },
      { text: 'Bahrain International', latin: true },
      { text: ' منذ ', latin: false },
      { text: '2019.', latin: true },
    ]);
  });
  it('takes an address, a time and a hyphenated name as one run each', () => {
    expect(latinRuns('youssef@zakydev.com 10:30 F1-WEC').map((r) => r.latin)).toEqual([true]);
  });
  it('leaves punctuation alone that has no letter or digit', () => {
    expect(latinRuns('اكتب لي عنه في سطور قليلة.')).toEqual([
      { text: 'اكتب لي عنه في سطور قليلة.', latin: false },
    ]);
  });
  it('returns the text unchanged when there is no Latin run', () => {
    expect(latinRuns('العربية · الإنجليزية')).toEqual([{ text: 'العربية · الإنجليزية', latin: false }]);
    expect(latinRuns('')).toEqual([]);
  });
  it('always joins back to the original text', () => {
    const text = 'Reply within two working days · أردّ خلال يومي عمل · UTC+3';
    expect(
      latinRuns(text)
        .map((r) => r.text)
        .join(''),
    ).toBe(text);
  });
});
