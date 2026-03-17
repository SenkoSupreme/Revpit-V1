export type ScoreInput = {
  carSpecCompleteness: number; // 0–100
  socialFollowers:     number;
  questCompletions:    number;
  clubActivity:        number;
  communityScore:      number; // raw community_score from profiles table
};

export type Tier = 'starter' | 'advanced' | 'pro' | 'elite';

export type ScoreResult = {
  score: number;
  tier:  Tier;
};

export type CommunityAction =
  | 'post_drop'         // +5
  | 'drop_10_revs'      // +15
  | 'drop_50_revs'      // +40
  | 'drop_trophy'       // +100
  | 'reply_10_revs'     // +10
  | 'build_update_drop' // +20

const MAX_SCORE = 10_000;

// Total must equal 1.00
const WEIGHTS = {
  carSpecCompleteness: 0.28,
  socialFollowers:     0.18,
  questCompletions:    0.30,
  clubActivity:        0.12,
  communityScore:      0.12,
} as const;

const SOFT_MAX = {
  socialFollowers:  10_000,
  questCompletions: 100,
  clubActivity:     100,
  communityScore:   5_000, // soft cap; heavy community users approach this
} as const;

const COMMUNITY_ACTION_POINTS: Record<CommunityAction, number> = {
  post_drop:         5,
  drop_10_revs:      15,
  drop_50_revs:      40,
  drop_trophy:       100,
  reply_10_revs:     10,
  build_update_drop: 20,
} as const;

function normalize(value: number, max: number): number {
  return Math.min(value / max, 1);
}

function tier(score: number): Tier {
  if (score >= 7_500) return 'elite';
  if (score >= 5_000) return 'pro';
  if (score >= 2_500) return 'advanced';
  return 'starter';
}

export function calculateScore(input: ScoreInput): ScoreResult {
  const {
    carSpecCompleteness,
    socialFollowers,
    questCompletions,
    clubActivity,
    communityScore,
  } = input;

  const weighted =
    normalize(carSpecCompleteness, 100)                       * WEIGHTS.carSpecCompleteness +
    normalize(socialFollowers,     SOFT_MAX.socialFollowers)  * WEIGHTS.socialFollowers     +
    normalize(questCompletions,    SOFT_MAX.questCompletions) * WEIGHTS.questCompletions    +
    normalize(clubActivity,        SOFT_MAX.clubActivity)     * WEIGHTS.clubActivity        +
    normalize(communityScore,      SOFT_MAX.communityScore)   * WEIGHTS.communityScore;

  const score = Math.round(weighted * MAX_SCORE);

  return { score, tier: tier(score) };
}

/**
 * Returns the point reward for a given community action.
 * Use with updateCommunityScore() in server actions.
 */
export function getCommunityScorePoints(action: CommunityAction): number {
  return COMMUNITY_ACTION_POINTS[action];
}
