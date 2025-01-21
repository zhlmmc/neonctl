import { describe, it, expect } from 'vitest';
import { getComputeUnits } from './compute_units';

describe('getComputeUnits', () => {
  it('should handle fixed size autoscaling', () => {
    const result = getComputeUnits('2');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 2,
      autoscaling_limit_max_cu: 2,
    });
  });

  it('should handle range autoscaling', () => {
    const result = getComputeUnits('0.5-1');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 0.5,
      autoscaling_limit_max_cu: 1,
    });
  });

  it('should throw error for invalid fixed size format', () => {
    expect(() => getComputeUnits('abc')).toThrowError(
      'Autoscaling should be either fixed size (e.g. 2) or min and max sizes delimited with a dash (e.g. "0.5-1")',
    );
  });

  it('should throw error for invalid min in range', () => {
    expect(() => getComputeUnits('abc-1')).toThrowError(
      'Autoscaling min should be a number',
    );
  });

  it('should throw error for invalid max in range', () => {
    expect(() => getComputeUnits('1-abc')).toThrowError(
      'Autoscaling max should be a number',
    );
  });

  it('should handle decimal values', () => {
    const result = getComputeUnits('0.25');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 0.25,
      autoscaling_limit_max_cu: 0.25,
    });
  });

  it('should handle decimal range values', () => {
    const result = getComputeUnits('0.25-0.75');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 0.25,
      autoscaling_limit_max_cu: 0.75,
    });
  });

  it('should handle zero values', () => {
    const result = getComputeUnits('0');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 0,
      autoscaling_limit_max_cu: 0,
    });
  });

  it('should handle zero range values', () => {
    const result = getComputeUnits('0-1');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 0,
      autoscaling_limit_max_cu: 1,
    });
  });

  it('should handle negative fixed values', () => {
    const result = getComputeUnits('-1');
    expect(result).toEqual({
      autoscaling_limit_min_cu: -1,
      autoscaling_limit_max_cu: -1,
    });
  });

  it('should throw error for missing max value', () => {
    expect(() => getComputeUnits('1-')).toThrowError(
      'Autoscaling should be either fixed size (e.g. 2) or min and max sizes delimited with a dash (e.g. "0.5-1")',
    );
  });

  it('should handle multiple dashes by using first two values', () => {
    const result = getComputeUnits('1-2-3');
    expect(result).toEqual({
      autoscaling_limit_min_cu: 1,
      autoscaling_limit_max_cu: 2,
    });
  });

  it('should throw error for invalid number formats', () => {
    expect(() => getComputeUnits('1.2.3')).toThrowError(
      'Autoscaling should be either fixed size (e.g. 2) or min and max sizes delimited with a dash (e.g. "0.5-1")',
    );
  });

  it('should throw error for non-numeric strings', () => {
    expect(() => getComputeUnits('test')).toThrowError(
      'Autoscaling should be either fixed size (e.g. 2) or min and max sizes delimited with a dash (e.g. "0.5-1")',
    );
  });
});
