// Décide quand proposer la demande d'avis App Store (SKStoreReviewController).
// Fonction pure pour rester testable. iOS limite de toute façon l'affichage (3 fois / 365 jours).

export const REVIEW_MIN_INTERVAL_DAYS = 120;
export const REVIEW_MAX_PROMPTS = 3;

export type ReviewPromptState = {
  /** Timestamp (ms) de la dernière demande, ou null si jamais demandé. */
  lastPromptAt: number | null;
  /** Nombre de demandes déjà faites. */
  promptCount: number;
};

/**
 * On ne demande un avis qu'à un moment positif : objectif du mois atteint
 * (ou objectif du jour atteint après plusieurs demandes espacées).
 * Jamais plus de REVIEW_MAX_PROMPTS fois, et au moins REVIEW_MIN_INTERVAL_DAYS entre deux demandes.
 */
export function shouldRequestReview(
  state: ReviewPromptState,
  monthDone: boolean,
  now: number,
): boolean {
  if (!monthDone) return false;
  if (state.promptCount >= REVIEW_MAX_PROMPTS) return false;
  if (state.lastPromptAt === null) return true;
  const elapsedDays = (now - state.lastPromptAt) / 86_400_000;
  return elapsedDays >= REVIEW_MIN_INTERVAL_DAYS;
}
