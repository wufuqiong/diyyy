import { it, expect, describe } from 'vitest';

import { calculateStageWidth } from '../calculateStageWidth';

describe('calculateStageWidth', () => {
  describe('contentColumns-based calculation', () => {
    it('returns contentColumns * minCellWidth + horizontalPadding when within bounds', () => {
      expect(calculateStageWidth({ contentColumns: 7 })).toBe(7 * 90 + 88); // 718
    });
  });

  describe('minWidth clamp', () => {
    it('clamps to minWidth=560 when calculated value is too low', () => {
      // calculated = 1*90+88 = 178, clamped to 560
      expect(calculateStageWidth({ contentColumns: 1 })).toBe(560);
    });
  });

  describe('maxWidth clamp', () => {
    it('clamps to maxWidth=920 when calculated value is too high', () => {
      // calculated = 20*90+88 = 1888, clamped to 920
      expect(calculateStageWidth({ contentColumns: 20 })).toBe(920);
    });
  });

  describe('default fallback', () => {
    it('returns 760 when no contentColumns is provided', () => {
      expect(calculateStageWidth()).toBe(760);
    });

    it('returns 760 when contentColumns is undefined', () => {
      expect(calculateStageWidth({})).toBe(760);
    });
  });

  describe('custom minCellWidth', () => {
    it('uses the provided minCellWidth instead of the default 90', () => {
      // calculated = 10*60+88 = 688, within [560, 920]
      expect(calculateStageWidth({ contentColumns: 10, minCellWidth: 60 })).toBe(688);
    });
  });

  describe('upper-bound clamping with default minCellWidth', () => {
    it('clamps contentColumns=10 to maxWidth=920', () => {
      expect(calculateStageWidth({ contentColumns: 10 })).toBe(920);
    });

    it('clamps contentColumns=12 to maxWidth=920', () => {
      expect(calculateStageWidth({ contentColumns: 12 })).toBe(920);
    });

    it('clamps contentColumns=18 to maxWidth=920', () => {
      expect(calculateStageWidth({ contentColumns: 18 })).toBe(920);
    });
  });
});
