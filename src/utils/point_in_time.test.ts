import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePITBranch, PointInTimeParseError } from './point_in_time';
import { looksLikeTimestamp, looksLikeLSN } from './formats.js';

vi.mock('./formats.js', () => ({
  looksLikeLSN: vi.fn(),
  looksLikeTimestamp: vi.fn(),
}));

describe('parsePITBranch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(looksLikeLSN).mockReturnValue(false);
    vi.mocked(looksLikeTimestamp).mockReturnValue(false);
  });

  it('should parse branch without point in time', () => {
    const result = parsePITBranch('main');
    expect(result).toEqual({
      branch: 'main',
      tag: 'head',
    });
  });

  it('should parse branch with LSN', () => {
    vi.mocked(looksLikeLSN).mockReturnValue(true);
    const result = parsePITBranch('main@0/1234567');
    expect(result).toEqual({
      branch: 'main',
      tag: 'lsn',
      lsn: '0/1234567',
    });
  });

  it('should parse branch with valid timestamp', () => {
    vi.mocked(looksLikeTimestamp).mockReturnValue(true);
    const pastTimestamp = new Date(Date.now() - 1000).toISOString();
    const result = parsePITBranch(`main@${pastTimestamp}`);
    expect(result).toEqual({
      branch: 'main',
      tag: 'timestamp',
      timestamp: pastTimestamp,
    });
  });

  it('should throw error for invalid timestamp format', () => {
    expect(() => parsePITBranch('main@invalid-timestamp')).toThrow(
      PointInTimeParseError,
    );
    expect(() => parsePITBranch('main@invalid-timestamp')).toThrow(
      'Invalid source branch format - main@invalid-timestamp',
    );
  });

  it('should throw error for future timestamp', () => {
    vi.mocked(looksLikeTimestamp).mockReturnValue(true);
    const futureTimestamp = new Date(Date.now() + 1000000).toISOString();
    expect(() => parsePITBranch(`main@${futureTimestamp}`)).toThrow(
      PointInTimeParseError,
    );
    expect(() => parsePITBranch(`main@${futureTimestamp}`)).toThrow(
      `Timestamp can not be in future - main@${futureTimestamp}`,
    );
  });

  it('should handle empty branch name', () => {
    const result = parsePITBranch('');
    expect(result).toEqual({
      branch: '',
      tag: 'head',
    });
  });

  it('should handle just @ character', () => {
    expect(() => parsePITBranch('@')).toThrow(PointInTimeParseError);
  });

  it('should handle special branch names', () => {
    const result = parsePITBranch('^self');
    expect(result).toEqual({
      branch: '^self',
      tag: 'head',
    });

    const result2 = parsePITBranch('^parent');
    expect(result2).toEqual({
      branch: '^parent',
      tag: 'head',
    });
  });

  it('should handle branch names containing @', () => {
    vi.mocked(looksLikeTimestamp).mockReturnValue(true);
    const result = parsePITBranch('feature@branch');
    expect(result).toEqual({
      branch: 'feature',
      tag: 'timestamp',
      timestamp: 'branch',
    });
  });
});
