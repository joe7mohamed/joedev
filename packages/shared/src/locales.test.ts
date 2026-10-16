import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, dirOf, isLocale, LOCALES, pickLocale } from './locales';

describe('locales', () => {
  it('lists exactly English and Arabic', () => {
    expect(LOCALES).toEqual(['en', 'ar']);
    expect(DEFAULT_LOCALE).toBe('en');
  });
  it('recognises valid locales only', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
  it('gives the writing direction', () => {
    expect(dirOf('en')).toBe('ltr');
    expect(dirOf('ar')).toBe('rtl');
  });
  it('picks Arabic only when it is the preferred language', () => {
    expect(pickLocale('ar-BH,ar;q=0.9,en;q=0.8')).toBe('ar');
    expect(pickLocale('en-US,ar;q=0.5')).toBe('en');
    expect(pickLocale('fr-FR')).toBe('en');
    expect(pickLocale(null)).toBe('en');
    expect(pickLocale('')).toBe('en');
  });
});
