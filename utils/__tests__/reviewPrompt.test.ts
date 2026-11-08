import { shouldRequestReview, REVIEW_MIN_INTERVAL_DAYS, REVIEW_MAX_PROMPTS } from '../reviewPrompt';

const DAY = 86_400_000;
const NOW = new Date('2026-11-09T12:00:00Z').getTime();
const fresh = { lastPromptAt: null, promptCount: 0 };

describe('shouldRequestReview', () => {
  it('ne demande rien tant que l\'objectif du mois n\'est pas atteint', () => {
    expect(shouldRequestReview(fresh, false, NOW)).toBe(false);
  });

  it('demande au premier moment positif', () => {
    expect(shouldRequestReview(fresh, true, NOW)).toBe(true);
  });

  it('respecte l\'intervalle minimum entre deux demandes', () => {
    const recent = { lastPromptAt: NOW - (REVIEW_MIN_INTERVAL_DAYS - 1) * DAY, promptCount: 1 };
    expect(shouldRequestReview(recent, true, NOW)).toBe(false);
  });

  it('redemande une fois l\'intervalle écoulé', () => {
    const old = { lastPromptAt: NOW - REVIEW_MIN_INTERVAL_DAYS * DAY, promptCount: 1 };
    expect(shouldRequestReview(old, true, NOW)).toBe(true);
  });

  it('ne dépasse jamais le nombre maximum de demandes', () => {
    const maxed = { lastPromptAt: NOW - 1000 * DAY, promptCount: REVIEW_MAX_PROMPTS };
    expect(shouldRequestReview(maxed, true, NOW)).toBe(false);
  });
});
