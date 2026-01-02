import { describe, it, expect } from 'vitest';
import { formatSize, formatDate } from './format';

describe('formatSize', () => {
  it('should format 0 bytes correctly', () => {
    expect(formatSize(0)).toBe('0 B');
  });

  it('should format bytes correctly', () => {
    expect(formatSize(500)).toBe('500 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatSize(1024)).toBe('1 KB');
    expect(formatSize(2048)).toBe('2 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatSize(1048576)).toBe('1 MB');
    expect(formatSize(5242880)).toBe('5 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatSize(1073741824)).toBe('1 GB');
  });

  it('should handle decimal values', () => {
    expect(formatSize(1536)).toBe('1.5 KB');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const dateString = '2024-01-15T10:30:00Z';
    const result = formatDate(dateString);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should handle different date formats', () => {
    const dateString = '2024-12-25';
    const result = formatDate(dateString);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
