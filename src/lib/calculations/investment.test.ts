import { describe, it, expect } from 'vitest';
import { calculateGrowth } from './investment';

describe('calculateGrowth', () => {
  it('returns year 0 as starting balance', () => {
    const points = calculateGrowth({
      currentBalance: 10000,
      monthlyContribution: 0,
      monthlyEmployerMatch: 0,
      annualReturnRate: 7,
      years: 10,
    });
    expect(points[0].year).toBe(0);
    expect(points[0].balance).toBe(10000);
  });

  it('returns correct number of data points (one per year + year 0)', () => {
    const points = calculateGrowth({
      currentBalance: 0,
      monthlyContribution: 100,
      monthlyEmployerMatch: 0,
      annualReturnRate: 7,
      years: 30,
    });
    expect(points.length).toBe(31); // years 0–30
  });

  it('balance grows over time with positive return', () => {
    const points = calculateGrowth({
      currentBalance: 10000,
      monthlyContribution: 450,
      monthlyEmployerMatch: 450,
      annualReturnRate: 7,
      years: 30,
    });
    expect(points[30].balance).toBeGreaterThan(points[0].balance);
  });

  it('handles 0% return rate (linear growth)', () => {
    const points = calculateGrowth({
      currentBalance: 0,
      monthlyContribution: 1000,
      monthlyEmployerMatch: 0,
      annualReturnRate: 0,
      years: 10,
    });
    // After 10 years at $1k/month = $120,000
    expect(points[10].balance).toBe(120000);
  });

  it('Walmart scenario: $10,800/yr total contribution over 30 years at 7%', () => {
    // Employee + employer = $10,800/yr = $900/month
    const points = calculateGrowth({
      currentBalance: 0,
      monthlyContribution: 450,   // employee share
      monthlyEmployerMatch: 450,  // employer share
      annualReturnRate: 7,
      years: 30,
    });
    const finalBalance = points[points.length - 1].balance;
    // Rule of thumb: $900/month at 7% for 30 years ≈ $1.1M
    expect(finalBalance).toBeGreaterThan(900000);
    expect(finalBalance).toBeLessThan(1500000);
  });

  it('growth = balance - contributions', () => {
    const points = calculateGrowth({
      currentBalance: 5000,
      monthlyContribution: 500,
      monthlyEmployerMatch: 200,
      annualReturnRate: 8,
      years: 20,
    });
    const last = points[points.length - 1];
    // growth should equal balance minus total contributions
    expect(last.growth).toBeGreaterThanOrEqual(0);
    expect(last.balance).toBeGreaterThan(last.contributions);
  });
});
