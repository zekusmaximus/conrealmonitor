import { calculateFragmentation } from '../index';

describe('calculateFragmentation', () => {
  it('should return high fragmentation for dissimilar strings', () => {
    const strings = ['apple', 'banana', 'carrot'];
    const result = calculateFragmentation(strings);
    expect(result).toBeGreaterThan(0.5);
  });

  it('should return low fragmentation for similar strings', () => {
    const strings = ['apple', 'apples', 'apple pie'];
    const result = calculateFragmentation(strings);
    expect(result).toBeLessThan(0.5);
  });

  it('should return 0 for less than 2 valid strings', () => {
    const strings = ['apple'];
    const result = calculateFragmentation(strings);
    expect(result).toBe(0);
  });
});
