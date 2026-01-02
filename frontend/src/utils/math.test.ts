import { describe, it, expect } from 'vitest';
import { calculatePercentage } from './math';

describe('calculatePercentage', () => {
  it('should return 0 when total is 0', () => {
    expect(calculatePercentage(100, 0)).toBe(0);
  });

  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(75, 100)).toBe(75);
  });

  it('should handle decimal percentages', () => {
    expect(calculatePercentage(33, 100)).toBe(33);
    expect(calculatePercentage(1, 3)).toBe(33.33);
  });

  it('should cap at 100%', () => {
    expect(calculatePercentage(150, 100)).toBe(100);
    expect(calculatePercentage(200, 100)).toBe(100);
  });

  it('should round to 2 decimal places', () => {
    expect(calculatePercentage(1, 3)).toBe(33.33);
    expect(calculatePercentage(2, 3)).toBe(66.67);
  });
});
