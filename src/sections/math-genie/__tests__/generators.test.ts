import { it, expect, describe } from 'vitest';

import { DisplayMode, ProblemType, MulDivLevel, OperationType, DifficultyLevel, ComparisonSubType, MultiOperationMode, SpecialPracticeType } from 'src/types';

describe('Math Genie Generators', () => {
  describe('1. MIXED mode addition/subtraction balance', () => {
    it('should generate balanced +/- counts with difference ≤ 1', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      
      const testCases = [
        { count: 10, expectedDiff: 0 },
        { count: 11, expectedDiff: 1 },
      ];

      for (const { count, expectedDiff } of testCases) {
        const { problems } = await generateMathProblems(
          'Animals 🐶',
          DifficultyLevel.EASY,
          OperationType.MIXED,
          count,
          undefined,
          undefined,
          ProblemType.STANDARD,
          SpecialPracticeType.NONE,
          undefined,
          false,
          DisplayMode.TEXT
        );

        const additions = problems.filter((p: any) => p.op === '+').length;
        const subtractions = problems.filter((p: any) => p.op === '-').length;
        const diff = Math.abs(additions - subtractions);

        expect(diff).toBeLessThanOrEqual(expectedDiff);
        expect(additions + subtractions).toBe(count);
      }
    }, 10000);
  });

  describe('2. CHAIN_SUBTRACTION intermediate results', () => {
    it('should ensure no intermediate result is negative', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.MEDIUM,
        OperationType.MULTI_OPERATIONS,
        20,
        undefined,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        { mode: MultiOperationMode.CHAIN_SUBTRACTION, numberCount: 3 },
        false,
        DisplayMode.TEXT
      );

      problems.forEach(problem => {
        if (problem.isMultiOperation && problem.numbers && problem.operators) {
          let current = problem.numbers[0];
          expect(current).toBeGreaterThanOrEqual(0);

          for (let i = 1; i < problem.numbers.length; i++) {
            if (problem.operators[i - 1] === '-') {
              current -= problem.numbers[i];
              expect(current).toBeGreaterThanOrEqual(0);
            }
          }
        }
      });
    });
  });

  describe('3. CHAIN_ADDITION number range', () => {
    it('should ensure all numbers fall within [min, max]', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const customDifficulty = { min: 5, max: 15 };

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.CUSTOM,
        OperationType.MULTI_OPERATIONS,
        20,
        customDifficulty,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 3 },
        false,
        DisplayMode.TEXT
      );

      problems.forEach(problem => {
        if (problem.isMultiOperation && problem.numbers) {
          problem.numbers.forEach(num => {
            expect(num).toBeGreaterThanOrEqual(customDifficulty.min);
            expect(num).toBeLessThanOrEqual(customDifficulty.max);
          });
        }
      });
    });
  });

  describe('4. FACT_FAMILY outputs 4 equations', () => {
    it('should generate 4 related equations (a+b, b+a, c-a, c-b) per family', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.EASY,
        OperationType.ADDITION,
        12,
        undefined,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.FACT_FAMILY,
        undefined,
        false,
        DisplayMode.TEXT
      );

      expect(problems.length % 4).toBe(0);

      for (let i = 0; i < problems.length; i += 4) {
        const family = problems.slice(i, i + 4);
        
        const p1 = family[0];
        const p2 = family[1];
        const p3 = family[2];
        const p4 = family[3];

        expect(p1.op).toBe('+');
        expect(p2.op).toBe('+');
        expect(p3.op).toBe('-');
        expect(p4.op).toBe('-');

        const a = p1.a;
        const b = p1.b;
        const c = a + b;

        expect(p2.a).toBe(b);
        expect(p2.b).toBe(a);
        expect(p3.a).toBe(c);
        expect(p3.b).toBe(a);
        expect(p4.a).toBe(c);
        expect(p4.b).toBe(b);
      }
    });
  });

  describe('5. FILL_BLANK + EMOJI mode excludes result blank', () => {
    it('should not have blankPosition="result" in EMOJI mode', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.EASY,
        OperationType.ADDITION,
        30,
        undefined,
        undefined,
        ProblemType.FILL_BLANK,
        SpecialPracticeType.NONE,
        undefined,
        false,
        DisplayMode.EMOJI
      );

      problems.forEach(problem => {
        if (problem.blankPosition) {
          expect(problem.blankPosition).not.toBe('result');
          expect(['first', 'second']).toContain(problem.blankPosition);
        }
      });
    });
  });

  describe('6. excludeZeroProblems constraint', () => {
    it('should not contain any zero when excludeZeroProblems=true', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.MEDIUM,
        OperationType.MIXED,
        30,
        undefined,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        undefined,
        true,
        DisplayMode.TEXT
      );

      problems.forEach(problem => {
        expect(problem.a).not.toBe(0);
        expect(problem.b).not.toBe(0);
        const result = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
        expect(result).not.toBe(0);
      });
    });

    it('should not hang with narrow range and excludeZeroProblems=true', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const startTime = Date.now();
      
      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.CUSTOM,
        OperationType.ADDITION,
        5,
        { min: 1, max: 2 },
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        undefined,
        true,
        DisplayMode.TEXT
      );

      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000);
      expect(problems.length).toBeGreaterThan(0);
    });
  });

  describe('7. CUSTOM difficulty range enforcement', () => {
    it('should strictly enforce custom difficulty range', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const customDifficulty = { min: 10, max: 20 };

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.CUSTOM,
        OperationType.ADDITION,
        30,
        customDifficulty,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        undefined,
        false,
        DisplayMode.TEXT
      );

      problems.forEach(problem => {
        const result = problem.a + problem.b;
        expect(result).toBeGreaterThanOrEqual(customDifficulty.min);
        expect(result).toBeLessThanOrEqual(customDifficulty.max);
      });
    });

    it('should enforce custom range for subtraction', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const customDifficulty = { min: 15, max: 25 };

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.CUSTOM,
        OperationType.SUBTRACTION,
        30,
        customDifficulty,
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        undefined,
        false,
        DisplayMode.TEXT
      );

      problems.forEach(problem => {
        expect(problem.a).toBeGreaterThanOrEqual(customDifficulty.min);
        expect(problem.a).toBeLessThanOrEqual(customDifficulty.max);
      });
    });
  });

  describe('8. generateRandomProblem narrow range handling', () => {
    it('should not throw stack overflow in narrow range', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const narrowRanges = [
        { min: 0, max: 0 },
        { min: 1, max: 1 },
        { min: 5, max: 5 },
      ];

      for (const customDifficulty of narrowRanges) {
        await expect(
          generateMathProblems(
            'Animals 🐶',
            DifficultyLevel.CUSTOM,
            OperationType.ADDITION,
            10,
            customDifficulty,
            undefined,
            ProblemType.STANDARD,
            SpecialPracticeType.NONE,
            undefined,
            true,
            DisplayMode.TEXT
          )
        ).resolves.toBeDefined();
      }
    });

    it('should return valid problems even in edge cases', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');

      const { problems } = await generateMathProblems(
        'Animals 🐶',
        DifficultyLevel.CUSTOM,
        OperationType.MIXED,
        10,
        { min: 2, max: 3 },
        undefined,
        ProblemType.STANDARD,
        SpecialPracticeType.NONE,
        undefined,
        false,
        DisplayMode.TEXT
      );

      expect(problems.length).toBeGreaterThan(0);
      problems.forEach(problem => {
        expect(problem.a).toBeDefined();
        expect(problem.b).toBeDefined();
        expect(problem.op).toMatch(/^[+-]$/);
      });
    });
  });

  describe('large ranges and multiplication digit levels', () => {
    it('counts the 100–10000 mixed range without enumerating every problem', async () => {
      const { calculateAddSubRangeUnique } = await import('src/features/math-genie/shared/problem-count');
      const startTime = Date.now();
      const count = calculateAddSubRangeUnique(100, 10000, OperationType.MIXED);

      expect(count).toBeGreaterThan(90_000_000);
      expect(Date.now() - startTime).toBeLessThan(50);
    });

    it('generates the 100–10000 mixed range without blocking', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const startTime = Date.now();
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.CUSTOM, OperationType.MIXED, 30,
        { min: 100, max: 10000 }, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NONE, undefined, false, DisplayMode.TEXT
      );

      expect(problems).toHaveLength(30);
      expect(Date.now() - startTime).toBeLessThan(1000);
      expect(problems.filter((problem) => problem.op === '+')).toHaveLength(15);
      expect(problems.filter((problem) => problem.op === '-')).toHaveLength(15);
    });

    it.each([
      ProblemType.STANDARD,
      ProblemType.FILL_BLANK,
    ])('keeps multiplication operands one-digit for %s problems', async (problemType) => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.CUSTOM, OperationType.MULTIPLICATION, 50,
        { min: 100, max: 10000 }, undefined, problemType,
        SpecialPracticeType.NONE, undefined, false, DisplayMode.TEXT,
        undefined, MulDivLevel.ONE_DIGIT
      );

      expect(problems).toHaveLength(50);
      problems.forEach((problem) => {
        expect(problem.a).toBeGreaterThanOrEqual(1);
        expect(problem.a).toBeLessThanOrEqual(9);
        expect(problem.b).toBeGreaterThanOrEqual(1);
        expect(problem.b).toBeLessThanOrEqual(9);
      });
    });

    it('keeps factors, divisors, and quotients one-digit in mixed ×÷ mode', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.CUSTOM, OperationType.MULT_DIV_MIXED, 40,
        { min: 100, max: 10000 }, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NONE, undefined, false, DisplayMode.TEXT,
        undefined, MulDivLevel.ONE_DIGIT
      );

      problems.forEach((problem) => {
        if (problem.op === '×') {
          expect(problem.a).toBeLessThanOrEqual(9);
        } else {
          expect(problem.a / problem.b).toBeLessThanOrEqual(9);
        }
        expect(problem.b).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('COLUMN_ARITHMETIC 10–100 range', () => {
    it.each([
      OperationType.ADDITION,
      OperationType.SUBTRACTION,
      OperationType.MIXED,
    ])('keeps at least one add/sub operand two-digit for %s', async (operation) => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.CUSTOM, operation, 40,
        { min: 10, max: 100 }, undefined, ProblemType.STANDARD,
        SpecialPracticeType.COLUMN_ARITHMETIC, undefined, false, DisplayMode.TEXT
      );

      expect(problems).toHaveLength(40);
      problems.forEach((problem) => {
        expect(problem.op).toMatch(/^[+-]$/);
        expect(problem.a >= 10 || problem.b >= 10).toBe(true);
      });
    });

    it.each([
      OperationType.ADDITION,
      OperationType.SUBTRACTION,
    ])('includes problems with two two-digit operands for %s', async (operation) => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.CUSTOM, operation, 100,
        { min: 10, max: 100 }, undefined, ProblemType.STANDARD,
        SpecialPracticeType.COLUMN_ARITHMETIC, undefined, false, DisplayMode.TEXT
      );

      expect(problems.some((problem) => problem.a >= 10 && problem.b >= 10)).toBe(true);
    });
  });

  // ---------- Number Bond tests ----------
  describe('NUMBER_BOND', () => {
    it('all problems satisfy parts[0] + parts[1] === whole', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.MEDIUM, OperationType.ADDITION, 20,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NUMBER_BOND, undefined, false, DisplayMode.TEXT
      );
      expect(problems.length).toBe(20);
      problems.forEach((p) => {
        expect(p.isNumberBond).toBe(true);
        expect(p.numberBondWhole).toBeDefined();
        expect(p.numberBondParts).toBeDefined();
        expect(p.numberBondParts![0] + p.numberBondParts![1]).toBe(p.numberBondWhole);
      });
    });

    it('excludeZeroProblems prevents zeros in parts', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.EASY, OperationType.ADDITION, 20,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NUMBER_BOND, undefined, true, DisplayMode.TEXT
      );
      expect(problems.length).toBeGreaterThan(0);
      problems.forEach((p) => {
        expect(p.numberBondParts![0]).not.toBe(0);
        expect(p.numberBondParts![1]).not.toBe(0);
      });
    });

    it('no duplicate problems within a batch', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.EASY, OperationType.ADDITION, 30,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NUMBER_BOND, undefined, false, DisplayMode.TEXT
      );
      const keys = new Set<string>();
      problems.forEach((p) => {
        const key = `${p.numberBondWhole}:${p.numberBondParts![0]}:${p.numberBondParts![1]}:${p.numberBondBlankIndex}`;
        expect(keys.has(key)).toBe(false);
        keys.add(key);
      });
    });

    it('produces various blankIndex values', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.MEDIUM, OperationType.ADDITION, 50,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NUMBER_BOND, undefined, false, DisplayMode.TEXT
      );
      const blanks = new Set(problems.map((p) => p.numberBondBlankIndex));
      expect(blanks.size).toBeGreaterThanOrEqual(2);
    });
  });

  // ---------- Page Layout tests ----------
  describe('derivePageLayout', () => {
    it.each([
      [OperationType.ADDITION, { min: 100, max: 10000 }, MulDivLevel.ONE_DIGIT, SpecialPracticeType.NONE, true],
      [OperationType.MIXED, { min: 10, max: 100 }, MulDivLevel.ONE_DIGIT, SpecialPracticeType.NONE, false],
      [OperationType.MULTIPLICATION, undefined, MulDivLevel.ONE_BY_TWO, SpecialPracticeType.NONE, false],
      [OperationType.DIVISION, undefined, MulDivLevel.TWO_DIGIT, SpecialPracticeType.NONE, true],
      [OperationType.MULT_DIV_MIXED, undefined, MulDivLevel.THREE_DIGIT, SpecialPracticeType.NONE, true],
      [OperationType.MULTIPLICATION, undefined, MulDivLevel.THREE_DIGIT, SpecialPracticeType.COLUMN_ARITHMETIC, false],
    ])('determines whether three columns must be disabled', async (
      operation,
      customDifficulty,
      mulDivLevel,
      specialPracticeType,
      expected,
    ) => {
      const { shouldDisableThreeColumns } = await import('src/features/math-genie/shared/layout');

      expect(shouldDisableThreeColumns({
        operation,
        customDifficulty,
        mulDivLevel,
        specialPracticeType,
      })).toBe(expected);
    });

    it('fontSize decreases monotonically as problemsPerPage increases', async () => {
      const { derivePageLayout } = await import('src/features/math-genie/shared/layout');
      const a = derivePageLayout({ columns: 3, problemsPerPage: 8 });
      const b = derivePageLayout({ columns: 3, problemsPerPage: 20 });
      const c = derivePageLayout({ columns: 3, problemsPerPage: 30 });
      expect(a.fontSize).toBeGreaterThanOrEqual(b.fontSize);
      expect(b.fontSize).toBeGreaterThanOrEqual(c.fontSize);
    });

    it('rowHeight >= 12mm for all boundary values', async () => {
      const { derivePageLayout } = await import('src/features/math-genie/shared/layout');
      for (const pp of [8, 15, 24, 30]) {
        const layout = derivePageLayout({ columns: 3, problemsPerPage: pp });
        expect(layout.rowHeight).toBeGreaterThanOrEqual(12);
      }
    });

    it('rows = ceil(problemsPerPage / columns)', async () => {
      const { derivePageLayout } = await import('src/features/math-genie/shared/layout');
      expect(derivePageLayout({ columns: 3, problemsPerPage: 15 }).rows).toBe(5);
      expect(derivePageLayout({ columns: 4, problemsPerPage: 15 }).rows).toBe(4);
      expect(derivePageLayout({ columns: 2, problemsPerPage: 10 }).rows).toBe(5);
    });
  });

  // ---------- Word Problem tests ----------
  describe('WORD_PROBLEM', () => {
    it('generates word problems in WORD_PROBLEM display mode', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.MEDIUM, OperationType.MIXED, 10,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NONE, undefined, false, DisplayMode.WORD_PROBLEM
      );
      expect(problems.length).toBeGreaterThanOrEqual(8);
      problems.forEach((p) => {
        expect(p.isWordProblem).toBe(true);
        expect(p.wordProblemText).toBeTruthy();
        expect(p.wordProblemText!.length).toBeGreaterThan(5);
        // No template placeholders left
        expect(p.wordProblemText).not.toMatch(/\{[^}]+\}/);
        expect(p.wordProblemText).not.toContain('undefined');
      });
    });

    it('subtraction problems have n1 >= n2', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.EASY, OperationType.SUBTRACTION, 20,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NONE, undefined, false, DisplayMode.WORD_PROBLEM
      );
      problems.forEach((p) => {
        if (p.op === '-') {
          expect(p.a).toBeGreaterThanOrEqual(p.b);
        }
      });
    });

    it('excludeZeroProblems prevents zeros', async () => {
      const { generateMathProblems } = await import('src/features/math-genie/generators');
      const { problems } = await generateMathProblems(
        'Animals 🐶', DifficultyLevel.EASY, OperationType.ADDITION, 20,
        undefined, undefined, ProblemType.STANDARD,
        SpecialPracticeType.NONE, undefined, true, DisplayMode.WORD_PROBLEM
      );
      problems.forEach((p) => {
        expect(p.a).not.toBe(0);
        expect(p.b).not.toBe(0);
      });
    });
  });

  // ---------- calculateOptimalProblemsPerPage tests ----------
  describe('calculateOptimalProblemsPerPage', () => {
    it('TEXT: standard 2 columns returns 18', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.TEXT,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBe(18);
    });

    it('TEXT: number bond 2 columns returns 8', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.TEXT,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NUMBER_BOND,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBe(8);
    });

    it('TEXT: multi-op 5 operands 2 columns returns 20', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.TEXT,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.MULTI_OPERATIONS,
        difficulty: DifficultyLevel.EASY,
        multiOperationConfig: { mode: MultiOperationMode.CHAIN_ADDITION, numberCount: 5 },
      });
      expect(result).toBe(20);
    });

    it('TEXT: 3 columns clamps to max 30', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.TEXT,
        columns: 3,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBe(27);
    });

    it('EMOJI: small range max<=5 returns 8', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.EMOJI,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBe(8);
    });

    it('EMOJI: large range max>10 returns 6 (capped at 58mm)', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.EMOJI,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.HARD,
      });
      expect(result).toBe(6);
    });

    it('WORD_PROBLEM: returns 4', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.WORD_PROBLEM,
        columns: 1,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBe(4);
    });

    it('EMOJI: medium range 5<max<=10 returns 6', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.EMOJI,
        columns: 2,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.NONE,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.MEDIUM,
      });
      expect(result).toBe(6);
    });
  });

  // ---------- COMPARISON tests ----------
  describe('COMPARISON', () => {
    const emojiPool = ['🍎', '🍌', '🍇', '🍊', '🍓', '🚗', '🚌', '🐶', '🐱', '🐰'];

    it('MAGNITUDE emoji: correct structure', async () => {
      const { generateComparisonProblems } = await import('src/features/math-genie/generators/special-practice/comparison');
      const problems = generateComparisonProblems({
        count: 10, subType: ComparisonSubType.MAGNITUDE, emojiPool,
        countRange: { min: 1, max: 5 }, displayMode: DisplayMode.EMOJI,
      });
      expect(problems.length).toBe(10);
      for (const p of problems) {
        expect(p.isComparison).toBe(true);
        expect(p.comparisonData?.subtype).toBe(ComparisonSubType.MAGNITUDE);
        expect(p.emoji1).not.toBe('');
        if (p.comparisonData!.relation !== '=') {
          expect(p.comparisonData!.groupA.emoji).not.toBe(p.comparisonData!.groupB.emoji);
        }
        const rel = p.comparisonData!.relation;
        if (rel === '>') expect(p.comparisonData!.groupA.count).toBeGreaterThan(p.comparisonData!.groupB.count);
        else if (rel === '<') expect(p.comparisonData!.groupA.count).toBeLessThan(p.comparisonData!.groupB.count);
        else expect(p.comparisonData!.groupA.count).toBe(p.comparisonData!.groupB.count);
      }
    });

    it('MAGNITUDE text: no emoji, correct structure', async () => {
      const { generateComparisonProblems } = await import('src/features/math-genie/generators/special-practice/comparison');
      const problems = generateComparisonProblems({
        count: 20, subType: ComparisonSubType.MAGNITUDE, emojiPool,
        countRange: { min: 1, max: 5 }, displayMode: DisplayMode.TEXT,
      });
      expect(problems.length).toBe(20);
      for (const p of problems) {
        expect(p.emoji1).toBe('');
        expect(p.emoji2).toBe('');
        expect(p.comparisonData?.subtype).toBe(ComparisonSubType.MAGNITUDE);
      }
      const hasEqual = problems.some((p) => p.comparisonData?.relation === '=');
      expect(hasEqual).toBe(true);
    });

    it('DIFFERENCE emoji: never equal', async () => {
      const { generateComparisonProblems } = await import('src/features/math-genie/generators/special-practice/comparison');
      const problems = generateComparisonProblems({
        count: 20, subType: ComparisonSubType.DIFFERENCE, emojiPool,
        countRange: { min: 1, max: 5 }, displayMode: DisplayMode.EMOJI,
      });
      expect(problems.length).toBe(20);
      for (const p of problems) {
        expect(p.comparisonData?.groupA.count).not.toBe(p.comparisonData?.groupB.count);
        expect(p.comparisonData?.relation).not.toBe('=');
        expect(p.emoji1).not.toBe('');
      }
    });

    it('DIFFERENCE text: no emoji, never equal', async () => {
      const { generateComparisonProblems } = await import('src/features/math-genie/generators/special-practice/comparison');
      const problems = generateComparisonProblems({
        count: 20, subType: ComparisonSubType.DIFFERENCE, emojiPool,
        countRange: { min: 1, max: 10 }, displayMode: DisplayMode.TEXT,
      });
      expect(problems.length).toBe(20);
      for (const p of problems) {
        expect(p.emoji1).toBe('');
        expect(p.comparisonData?.groupA.count).not.toBe(p.comparisonData?.groupB.count);
      }
    });

    it('deduplicates within a batch', async () => {
      const { generateComparisonProblems } = await import('src/features/math-genie/generators/special-practice/comparison');
      const problems = generateComparisonProblems({
        count: 10, subType: ComparisonSubType.MAGNITUDE, emojiPool,
        countRange: { min: 1, max: 5 }, displayMode: DisplayMode.EMOJI,
      });
      const keys = problems.map((p) => `${p.comparisonData!.groupA.count}:${p.comparisonData!.groupB.count}`);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it('layout: returns reasonable ppp', async () => {
      const { calculateOptimalProblemsPerPage } = await import('src/features/math-genie/shared/layout');
      const result = calculateOptimalProblemsPerPage({
        displayMode: DisplayMode.TEXT,
        columns: 1,
        problemType: ProblemType.STANDARD,
        specialPracticeType: SpecialPracticeType.COMPARISON,
        operation: OperationType.ADDITION,
        difficulty: DifficultyLevel.EASY,
      });
      expect(result).toBeGreaterThanOrEqual(6);
      expect(result).toBeLessThanOrEqual(20);
    });
  });
});
