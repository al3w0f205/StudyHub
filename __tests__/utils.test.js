import {
  isSubscriptionActive,
  formatDate,
  formatDateTime,
  slugify,
  daysRemaining,
  truncate,
  cn
} from '../src/lib/utils';

describe('StudyHub Utilities', () => {
  
  describe('isSubscriptionActive', () => {
    it('returns true for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      expect(isSubscriptionActive(futureDate)).toBe(true);
    });

    it('returns false for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isSubscriptionActive(pastDate)).toBe(false);
    });

    it('returns false for null or undefined', () => {
      expect(isSubscriptionActive(null)).toBe(false);
      expect(isSubscriptionActive(undefined)).toBe(false);
    });
  });

  describe('daysRemaining', () => {
    it('calculates exact days remaining correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(daysRemaining(futureDate)).toBe(10);
    });

    it('returns 0 for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(daysRemaining(pastDate)).toBe(0);
    });
  });

  describe('slugify', () => {
    it('converts text to URL friendly format', () => {
      expect(slugify('Medicina Renal y Digestiva')).toBe('medicina-renal-y-digestiva');
      expect(slugify('¡Atención! ¿Qué es esto?')).toBe('atencion-que-es-esto');
      expect(slugify('  Espacios   extra  ')).toBe('espacios-extra');
    });
  });

  describe('truncate', () => {
    it('truncates strings that exceed max length', () => {
      expect(truncate('Este es un texto muy largo', 10)).toBe('Este es un…');
    });

    it('returns the same string if it is shorter than max length', () => {
      expect(truncate('Corto', 10)).toBe('Corto');
    });
  });

  describe('cn (Classnames)', () => {
    it('merges multiple valid classes and ignores falsy values', () => {
      expect(cn('btn', 'btn-primary', null, undefined, false, 'active')).toBe('btn btn-primary active');
    });
  });

});
