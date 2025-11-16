# 🎯 Coverage Thresholds Configuration

## Overview

This project enforces strict code coverage thresholds to ensure high-quality testing, especially for critical components that prevent React Error #185 regressions.

## Threshold Levels

### Critical Files (90% minimum)

The following directories contain business-critical code and must maintain **90% coverage** for lines, functions, and statements:

#### 📦 `src/stores/` - State Management
- **Lines**: 90%
- **Functions**: 90%
- **Branches**: 85%
- **Statements**: 90%

**Why**: Store logic controls application state. Bugs here can cause cascading failures across the entire application.

#### 🎮 `src/components/battle/enhanced/` - Battle Components
- **Lines**: 90%
- **Functions**: 90%
- **Branches**: 85%
- **Statements**: 90%

**Why**: These components are prone to React Error #185 if hooks are used incorrectly. High coverage prevents regressions.

### Standard Files (80% minimum)

All other files must maintain **80% coverage**:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## How It Works

### 1. Vitest Configuration

`vitest.config.ts` defines coverage thresholds:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
    'src/stores/**/*.ts': {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
    'src/components/battle/enhanced/**/*.tsx': {
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
  },
}
```

### 2. Automated Checks

#### Local Development
```bash
# Run tests with coverage
npm run test -- --coverage

# Check thresholds
node scripts/check-coverage-thresholds.js
```

#### Pre-commit Hook
Husky automatically runs coverage checks before each commit for changed files.

#### GitHub Actions
Every PR and push triggers:
1. Full test suite
2. Coverage generation
3. Threshold validation
4. **PR blocking** if thresholds not met

## CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: 🎯 Check coverage thresholds
  run: node scripts/check-coverage-thresholds.js
```

This step will **FAIL** the CI pipeline if:
- Any critical file has < 90% coverage
- Global coverage drops below 80%

### PR Status Checks

When thresholds are not met:
- ❌ CI check fails
- 🚫 PR cannot be merged
- 📊 Detailed coverage report shows gaps
- 💬 Comment added to PR with specifics

## Coverage Check Script

The `scripts/check-coverage-thresholds.js` script:

1. ✅ Loads coverage summary JSON
2. 📁 Identifies critical files by path pattern
3. 📊 Calculates aggregate coverage metrics
4. 🎯 Compares against thresholds
5. 📝 Generates detailed report
6. ❌ Exits with code 1 if any threshold missed

### Example Output

```
🔍 Checking coverage thresholds for critical files...

📊 Coverage Threshold Check Results
════════════════════════════════════════════════════════════

✅ src/stores/
   Files checked: 5

   Current Coverage:
   ✓ lines        92.50% (threshold: 90%)
   ✓ functions    91.00% (threshold: 90%)
   ✓ branches     87.00% (threshold: 85%)
   ✓ statements   92.50% (threshold: 90%)

❌ src/components/battle/enhanced/
   Files checked: 3

   Current Coverage:
   ✗ lines        88.00% (threshold: 90%)
   ✓ functions    90.00% (threshold: 90%)
   ✗ branches     82.00% (threshold: 85%)
   ✓ statements   89.00% (threshold: 90%)

   Failures:
   • lines: 88.00% (need 2.00% more to reach 90%)
   • branches: 82.00% (need 3.00% more to reach 85%)

════════════════════════════════════════════════════════════

❌ Coverage check FAILED!
Critical files must have at least 90% coverage for lines, functions, and statements.
Please add more tests to reach the required coverage thresholds.
```

## Improving Coverage

### For Stores

```typescript
// ❌ Untested code
export const useMyStore = create((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}));

// ✅ Well-tested code
describe('useMyStore', () => {
  it('increments value', () => {
    const { result } = renderHook(() => useMyStore());
    act(() => result.current.increment());
    expect(result.current.value).toBe(1);
  });
});
```

### For Components

```typescript
// ❌ Untested component
export const MyComponent = ({ onClick }) => (
  <button onClick={onClick}>Click</button>
);

// ✅ Well-tested component
describe('MyComponent', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

## Viewing Coverage Reports

### Local HTML Report
```bash
npm run test -- --coverage
open coverage/index.html
```

### GitHub Actions Artifacts
1. Go to Actions tab
2. Select workflow run
3. Download `coverage-report` artifact
4. Extract and open `index.html`

### Codecov Dashboard
View detailed coverage trends at: `https://codecov.io/gh/YOUR_ORG/YOUR_REPO`

## Coverage Metrics Explained

| Metric | Description | Example |
|--------|-------------|---------|
| **Lines** | % of executable lines run | `const x = 1;` |
| **Functions** | % of functions called | `function foo() {}` |
| **Branches** | % of if/else paths taken | `if (x) {} else {}` |
| **Statements** | % of statements executed | `return x + 1;` |

## Exceptions

### When to Request Exemption

Coverage thresholds can be adjusted for:
- Auto-generated code
- Legacy code being refactored
- Code requiring complex mocking

### How to Request

1. Open issue explaining why threshold cannot be met
2. Propose alternative verification strategy
3. Get approval from 2+ reviewers
4. Update `vitest.config.ts` with exemption

## Best Practices

### ✅ DO

- Write tests before implementing features (TDD)
- Test edge cases and error conditions
- Mock external dependencies properly
- Use `beforeEach` to reset state between tests
- Test user interactions, not implementation details

### ❌ DON'T

- Write tests just to increase coverage %
- Test implementation details instead of behavior
- Skip error handling tests
- Ignore console warnings in tests
- Commit code that fails coverage checks

## Monitoring Coverage Trends

### GitHub Actions Summary
Every workflow run includes coverage trends:
- Overall percentage
- Per-directory breakdown
- Threshold pass/fail status

### Weekly Reports
Coverage reports are published to GitHub Pages:
- `https://YOUR_ORG.github.io/YOUR_REPO/coverage/`

## Troubleshooting

### Coverage Check Fails Locally But Passes in CI
```bash
# Clear coverage cache
rm -rf coverage/
npm run test -- --coverage --run
```

### Thresholds Too Strict
If legitimate code cannot reach 90%:
1. Review if code is testable (might indicate design issue)
2. Consider if code should be in "critical" directory
3. Request threshold adjustment with justification

### False Positive Coverage
```bash
# View coverage for specific file
npm run test -- --coverage src/stores/myStore.ts
```

Check that tests actually verify behavior, not just execute code.

## Related Documentation

- [Testing Guide](./TESTING.md)
- [GitHub Actions Setup](./GITHUB_ACTIONS_SETUP.md)
- [Husky Pre-commit Hooks](./HUSKY_SETUP.md)
- [Quick Start Guide](./QUICK_START_CI.md)

## Support

Questions about coverage thresholds?
- Check existing test examples in `__tests__/` directories
- Review [Vitest Coverage Docs](https://vitest.dev/guide/coverage.html)
- Open a discussion on GitHub
