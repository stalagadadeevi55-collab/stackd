import { describe, it, expect } from 'vitest';
import { generateRecommendations } from './recommendations';
import { calculateEmployerMatch } from './retirement';
import type { UserProfile } from '../../types/index';

const walmartProfile: UserProfile = {
  id: 'test-id',
  age: 22,
  state: 'AR',
  city: 'Bentonville',
  grossAnnualSalary: 90000,
  payFrequency: 'biweekly',
  filingStatus: 'single',
  contributionPct401k: 6,
  employerMatchPct: 100,
  employerMatchCapPct: 6,
  monthlyRent: 1200,
  monthlyCar: 300,
  monthlyInsurance: 150,
  monthlyStudentLoans: 200,
  monthlyFood: 550,
  monthlyUtilities: 150,
  monthlyFun: 300,
  monthlyTravel: 100,
  otherMonthlyExpenses: 0,
  emergencyFundMonths: 6,
  currentInvestmentBalance: 0,
  expectedAnnualReturn: 7,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('generateRecommendations', () => {
  it('returns recommendations sorted by priority', () => {
    const match = calculateEmployerMatch(walmartProfile);
    const recs = generateRecommendations(walmartProfile, match);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].priority).toBeGreaterThanOrEqual(recs[i - 1].priority);
    }
  });

  it('does NOT include employer match rec when fully captured', () => {
    const match = calculateEmployerMatch(walmartProfile); // at 6%, fully captured
    const recs = generateRecommendations(walmartProfile, match);
    const matchRec = recs.find(r => r.type === 'match');
    expect(matchRec).toBeUndefined();
  });

  it('includes employer match rec when under-contributing', () => {
    const underProfile = { ...walmartProfile, contributionPct401k: 3 };
    const match = calculateEmployerMatch(underProfile);
    const recs = generateRecommendations(underProfile, match);
    const matchRec = recs.find(r => r.type === 'match');
    expect(matchRec).toBeDefined();
    expect(matchRec?.priority).toBe(1);
  });

  it('includes emergency fund rec when balance is low', () => {
    const match = calculateEmployerMatch(walmartProfile);
    const recs = generateRecommendations(walmartProfile, match);
    const efRec = recs.find(r => r.type === 'emergency');
    expect(efRec).toBeDefined(); // $0 balance vs ~$14,100 target
  });

  it('does not include emergency fund rec when balance is sufficient', () => {
    const richProfile = { ...walmartProfile, currentInvestmentBalance: 100000 };
    const match = calculateEmployerMatch(richProfile);
    const recs = generateRecommendations(richProfile, match);
    const efRec = recs.find(r => r.type === 'emergency');
    expect(efRec).toBeUndefined();
  });

  it('always includes debt reminder', () => {
    const match = calculateEmployerMatch(walmartProfile);
    const recs = generateRecommendations(walmartProfile, match);
    const debtRec = recs.find(r => r.type === 'debt');
    expect(debtRec).toBeDefined();
  });

  it('match recommendation mentions correct percentages', () => {
    const underProfile = { ...walmartProfile, contributionPct401k: 3 };
    const match = calculateEmployerMatch(underProfile);
    const recs = generateRecommendations(underProfile, match);
    const matchRec = recs.find(r => r.type === 'match');
    expect(matchRec?.description).toContain('3%');
    expect(matchRec?.description).toContain('6%');
  });
});
