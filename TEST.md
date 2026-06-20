# DIYYY Test Plan

## Test Infrastructure

- **Framework:** Vitest with `jsdom` environment
- **Globals:** `true` (no imports needed for `describe`/`it`/`expect`)
- **Test files:**
  - `src/sections/math-genie/__tests__/generators.test.ts` (29 cases)
  - `src/features/word-search/generators/__tests__/grid-generator.test.ts`
- **Run:** `yarn test` (watch) / `yarn test:run` (single run) / `npx vitest run path/to/file`

---

## Test Suite: Math Genie Generators

All tests dynamically import modules (`await import(...)`) to match the project's module system.

### 1. MIXED mode addition/subtraction balance

**Test:** `should generate balanced +/- counts with difference ≤ 1`

- Generates 10 problems with `OperationType.MIXED` at EASY difficulty
- Asserts: difference between addition and subtraction count ≤ 0
- Generates 11 problems, asserts difference ≤ 1
- Verifies total count equals requested count

**Test setup:** `generateMathProblems(MIXED, EASY, count=10, DisplayMode.TEXT)`

### 2. CHAIN_SUBTRACTION intermediate results

**Test:** `should ensure no intermediate result is negative`

- Generates 20 multi-operation problems with `CHAIN_SUBTRACTION`, 3 numbers, MEDIUM difficulty
- For each multi-op problem: iterates through numbers, applying operators
- Asserts: intermediate step result never goes negative

### 3. CHAIN_ADDITION number range

**Test:** `should ensure all numbers fall within [min, max]`

- Uses `DifficultyLevel.CUSTOM` with `{min: 5, max: 15}`
- Generates 20 multi-op chain addition problems (3 numbers)
- Asserts: every operand is within [5, 15]

### 4. FACT_FAMILY outputs 4 equations

**Test:** `should generate 4 related equations (a+b, b+a, c-a, c-b) per family`

- Generates 12 fact family problems
- Asserts: total count is divisible by 4
- For each group of 4:
  - p1: a + b = c (addition)
  - p2: b + a = c (commutative addition)
  - p3: c - a = b (subtraction)
  - p4: c - b = a (subtraction)

### 5. FILL_BLANK + EMOJI mode excludes result blank

**Test:** `should not have blankPosition="result" in EMOJI mode`

- Generates 30 fill-blank problems in EMOJI display mode
- Asserts: no problem has `blankPosition === 'result'`
- Only 'first' or 'second' positions allowed

### 6. excludeZeroProblems constraint

**Test A:** `should not contain any zero when excludeZeroProblems=true`

- Generates 30 MIXED problems at MEDIUM difficulty with `excludeZeroProblems: true`
- Asserts: neither operand is 0, and the result is never 0

**Test B:** `should not hang with narrow range and excludeZeroProblems=true`

- Uses CUSTOM difficulty `{min: 1, max: 2}` with exclusion enabled
- Generates 5 problems
- Asserts: duration < 5000ms (no infinite loop), at least some problems returned

### 7. CUSTOM difficulty range enforcement

**Test A:** `should strictly enforce custom difficulty range`

- Uses `{min: 10, max: 20}` with ADDITION
- Generates 30 problems
- Asserts: all results are within [10, 20]

**Test B:** `should enforce custom range for subtraction`

- Uses `{min: 15, max: 25}` with SUBTRACTION
- Asserts: all `a` values are within [15, 25]

### 8. generateRandomProblem narrow range handling

**Test A:** `should not throw stack overflow in narrow range`

- Tests three edge cases: `{0,0}`, `{1,1}`, `{5,5}` (min = max)
- Asserts: all resolve without throwing

**Test B:** `should return valid problems even in edge cases`

- Uses `{min: 2, max: 3}` with MIXED operations
- Generates 10 problems
- Asserts: all problems have defined `a`, `b`, and valid operator (+/-)

### NUMBER_BOND tests

**Test A:** `all problems satisfy parts[0] + parts[1] === whole`

- Generates 20 number bond problems at MEDIUM difficulty
- Asserts: every problem has `isNumberBond: true` and parts sum equals whole

**Test B:** `excludeZeroProblems prevents zeros in parts`

- Generates 20 number bond problems at EASY with `excludeZeroProblems: true`
- Asserts: no part is 0

**Test C:** `no duplicate problems within a batch`

- Generates 30 number bond problems
- Creates dedup keys from `whole:part0:part1:blankIndex`
- Asserts: all keys are unique

**Test D:** `produces various blankIndex values`

- Generates 50 number bond problems at MEDIUM
- Collects unique `blankIndex` values
- Asserts: at least 2 different blank positions appear (0, 1, or 'whole')

### derivePageLayout tests

**Test A:** `fontSize decreases monotonically as problemsPerPage increases`

- Compares layout for (3 cols, 8ppp) vs (3 cols, 20ppp) vs (3 cols, 30ppp)
- Asserts: fontSize is monotonically non-increasing

**Test B:** `rowHeight >= 12mm for all boundary values`

- Tests problemsPerPage values: 8, 15, 24, 30 with 3 columns
- Asserts: all row heights ≥ 12mm (the clamp minimum)

**Test C:** `rows = ceil(problemsPerPage / columns)`

- (3 cols, 15 ppp) → 5 rows
- (4 cols, 15 ppp) → 4 rows
- (2 cols, 10 ppp) → 5 rows

### WORD_PROBLEM tests

**Test A:** `generates word problems in WORD_PROBLEM display mode`

- Generates 10 MIXED word problems at MEDIUM difficulty
- Asserts: all have `isWordProblem: true`, non-empty text > 5 chars
- No template placeholders (`{...}`) or 'undefined' in text

**Test B:** `subtraction problems have n1 >= n2`

- Generates 20 SUBTRACTION word problems
- Asserts: `a >= b` for all subtraction problems

**Test C:** `excludeZeroProblems prevents zeros`

- Generates 20 word problems with `excludeZeroProblems: true`
- Asserts: no zero operands

### calculateOptimalProblemsPerPage tests

**Test A:** `TEXT: standard 2 columns returns 20`

- Standard ADDITION, EASY, 2 cols → 20 problems (10 rows × 2 cols)

**Test B:** `TEXT: number bond 2 columns returns 8`

- NUMBER_BOND special practice → 8 problems (SVG height ~47mm)

**Test C:** `TEXT: multi-op 5 operands 2 columns returns 22`

- MULTI_OPERATIONS with 5 operands → 22 problems

**Test D:** `TEXT: 3 columns clamps to max 30`

- 3 columns with standard text → clamped at 30

**Test E:** `EMOJI: small range max<=5 returns 12`

- EASY difficulty (max=5), emoji mode → 12 problems (2 cols × 6 rows)

**Test F:** `EMOJI: large range max>10 returns 6`

- HARD difficulty (max=20), emoji mode → 6 problems (2 cols × 3 rows)

**Test G:** `WORD_PROBLEM: returns 4`

- Word problem mode → 4 problems (1 col × 4 rows at 48mm)

**Test H:** `EMOJI: medium range 5<max<=10 returns 8`

- MEDIUM difficulty (max=10), emoji mode → 8 problems

---

## Test Suite: Word Search Generators

File: `src/features/word-search/generators/__tests__/grid-generator.test.ts`. All randomness is seeded (`lcg`) so cases are reproducible.

### rng.ts

- **deterministic output for a given seed** — `lcg(42)` twice yields identical 10-value sequences.
- **different output for different seeds** — `lcg(1)` vs `lcg(9999)` differ.

### word-placement.ts (`tryPlaceWord`)

- **places a horizontal word** — returns non-null with correct word, direction, and 3 cells for `CAT`.
- **placed cells match grid content** — writing the word along `cells` and reading back equals the word.
- **conflict detection** — across 50 seeded attempts, never overwrites a differing pre-filled character.
- **cross-sharing allowed** — when crossing an existing cell, the shared character always matches.
- **out of bounds returns null** — a 20-char word cannot fit a 5×5 grid.

### filler.ts

- **fillEmpty fills all empty cells** — no empty cells remain; uppercase output matches `/[A-Z]/`.
- **fillEmpty respects lowercase** — output matches `/[a-z]/` when `letterCase='lower'`.
- **detectAccidentalWords** — detects a target word forward, case-insensitively, and reversed; does not flag non-targets; returns false for an empty target list.

### grid-generator.ts (`generateWordSearchGrid`, integration)

- **fully filled grid** — SMALL grid is 10×10 with no empty cells and at least one placed word.
- **places all words with enough space** — `['cat','dog']` on MEDIUM places both, zero unplaced.
- **unplaceable words → `unplacedWords`** — a 20-char word in SMALL goes to unplaced without throwing.
- **no throw on extreme input** — 50 long words on SMALL/HARD does not throw (soft timeout).
- **reproducible with same seed** — identical `grid`, `placedWords`, `unplacedWords` for the same seed.
- **empty word list handled** — no placed/unplaced words; grid still initialized.
- **deduplicates words** — duplicate inputs yield unique placed words.
- **respects difficulty** — EASY only produces `horizontal`/`vertical` placements.

Run: `npx vitest run src/features/word-search/generators/__tests__/grid-generator.test.ts`

---

## Test Coverage Summary

| Category | Tests | What's Covered |
|----------|-------|---------------|
| Mixed operations balance | 2 | +/- ratio within 1 |
| Chain subtraction validation | 1 | No negative intermediates |
| Chain addition range check | 1 | Operands within custom range |
| Fact family structure | 1 | 4 related equations per family |
| Fill-blank mode constraints | 1 | No result blank in emoji |
| Zero exclusion | 2 | No zeros, narrow range no hang |
| Custom difficulty range | 2 | Addition + subtraction range enforcement |
| Narrow range edge cases | 2 | Min=max ranges, small ranges |
| Number bond | 4 | Math correctness, zero exclusion, dedup, variety |
| Page layout (derivePageLayout) | 3 | Font scaling, row height bounds, row count |
| Word problem | 3 | Content generation, subtraction constraint, zero exclusion |
| Optimal problems per page | 8 | All display modes, column counts, special practices |

**Math Genie total: 29 test cases**

### Word Search

| Category | Tests | What's Covered |
|----------|-------|---------------|
| Seeded RNG (`lcg`) | 2 | Determinism, seed sensitivity |
| Word placement | 5 | Direction, read-back, conflict, cross-share, bounds |
| Filler + accidental words | 7 | Case-correct fill, target detection (fwd/rev/case), non-targets |
| Grid generator (integration) | 8 | Full fill, capacity, reproducibility, dedupe, difficulty, no-throw |

**Word Search total: 22 test cases**

## Running Tests

```bash
# All tests
npx vitest run

# Single test file
npx vitest run src/sections/math-genie/__tests__/generators.test.ts
npx vitest run src/features/word-search/generators/__tests__/grid-generator.test.ts

# Watch mode
yarn test

# With verbose output
npx vitest run --reporter=verbose
```
