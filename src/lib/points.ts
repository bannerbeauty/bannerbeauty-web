// Points multipliers — update here if the points system changes
export const POINTS_MULTIPLIERS = {
  BANNER_BUMP: 1.25,        // All paid banner bumps (PC and non-PC)
  STORE_PURCHASE: 1.0,      // Non-PC store purchases
  STORE_PURCHASE_PC: 1.25,  // PC member store purchases
  PC_MEMBERSHIP: 1.5,       // Patriot's Club membership purchase
  REFERRAL_BONUS: 0.03,     // 3% of referee's points
} as const;

export function calculatePoints(amount: number, multiplier: number): number {
  return Math.round(amount * multiplier);
}
