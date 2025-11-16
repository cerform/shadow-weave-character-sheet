# 🎯 Quick Start: Coverage Thresholds

## TL;DR

Your PR **WILL BE BLOCKED** if:
- Coverage < 90% for `src/stores/` or `src/components/battle/enhanced/`
- Coverage < 80% for other files

## Check Coverage Locally

```bash
# Run tests with coverage
npm run test -- --coverage

# Check if thresholds are met
node scripts/check-coverage-thresholds.js
```

## Example Output

### ✅ Passing
```
📊 Coverage Threshold Check Results
════════════════════════════════════════════════════════════

✅ src/stores/
   Files checked: 5
   Current Coverage:
   ✓ lines        92.50% (threshold: 90%)
   ✓ functions    91.00% (threshold: 90%)
   ✓ branches     87.00% (threshold: 85%)
   ✓ statements   92.50% (threshold: 90%)

✅ All coverage thresholds met!
```

### ❌ Failing
```
📊 Coverage Threshold Check Results
════════════════════════════════════════════════════════════

❌ src/stores/
   Files checked: 5
   Current Coverage:
   ✗ lines        88.00% (threshold: 90%)
   ✓ functions    90.00% (threshold: 90%)
   
   Failures:
   • lines: 88.00% (need 2.00% more to reach 90%)

❌ Coverage check FAILED!
```

## How to Fix Low Coverage

### 1. Find Uncovered Code
```bash
# Generate HTML report
npm run test -- --coverage

# Open in browser
open coverage/index.html
```

### 2. Add Tests

**For stores:**
```typescript
// src/stores/__tests__/myStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from '../myStore';

describe('useMyStore', () => {
  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyStore());
    
    act(() => {
      result.current.setValue(42);
    });
    
    expect(result.current.value).toBe(42);
  });
});
```

**For components:**
```typescript
// src/components/battle/enhanced/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders and handles clicks', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### 3. Verify Coverage
```bash
# Run tests again
npm run test -- --coverage

# Check specific file
npm run test -- --coverage src/stores/myStore.ts
```

### 4. Commit & Push
```bash
git add .
git commit -m "test: increase coverage to meet thresholds"
git push
```

## What Happens in CI?

### On Every Push/PR

1. **Tests Run** - All tests execute
2. **Coverage Generated** - Detailed report created
3. **Thresholds Checked** - Script validates coverage
4. **PR Status Updated**:
   - ✅ Green check = Coverage meets thresholds
   - ❌ Red X = Coverage too low (PR blocked)

### If Thresholds Not Met

- ❌ CI check fails
- 🚫 **PR cannot be merged**
- 💬 Automated comment posted to PR
- 📊 Coverage report shows gaps

### Automated Comment Example

```markdown
## ❌ Coverage Threshold Check Failed!

Your PR does not meet the required coverage thresholds.

### 📊 Current Coverage
| Metric | Coverage | Required |
|--------|----------|----------|
| Lines | 88% | 90% (critical) |

### 🔴 Critical Files (90% minimum)
- src/stores/**/*.ts ❌
- src/components/battle/enhanced/**/*.tsx ✅

### 📚 How to Fix
1. Run `npm run test -- --coverage` locally
2. Check which files need more tests
3. Add tests to reach thresholds
```

## Coverage Requirements

### 🔴 Critical Files (90% minimum)
- `src/stores/**/*.ts`
  - State management
  - Business logic
  - Selector functions

- `src/components/battle/enhanced/**/*.tsx`
  - Battle components
  - React hooks (Error #185 protection)
  - 3D rendering logic

### 🟡 Other Files (80% minimum)
- All other `.ts` and `.tsx` files
- Utility functions
- Helper modules

## Bypass Options (Emergency Only)

### Temporary Exemption
If you absolutely cannot reach thresholds:

1. **Document why** in PR description
2. **Get 2+ approvals** from maintainers
3. **Create follow-up issue** to add tests later
4. **Merge manually** (requires admin)

### Permanent Exemption
For specific files that genuinely can't be tested:

1. **Open GitHub issue** explaining situation
2. **Propose alternative** verification strategy
3. **Get approval** from core team
4. **Update `vitest.config.ts`** with exemption

## Monitoring Coverage

### Local HTML Report
```bash
npm run test -- --coverage
open coverage/index.html
```

### Codecov Dashboard
View trends: `https://codecov.io/gh/YOUR_ORG/YOUR_REPO`

### GitHub Pages
Public report: `https://YOUR_ORG.github.io/YOUR_REPO/coverage/`

## Troubleshooting

### "Coverage not found"
```bash
# Clear cache and regenerate
rm -rf coverage/ node_modules/.vitest
npm run test -- --coverage --run
```

### "Thresholds too strict"
1. Review if code is testable
2. Consider refactoring untestable code
3. Request exemption with justification

### "Tests pass locally but fail in CI"
```bash
# Run exactly as CI does
npm ci
npm run test -- --coverage --run
node scripts/check-coverage-thresholds.js
```

### "False positive coverage"
Check that tests verify behavior, not just execute code:
```typescript
// ❌ BAD - Just executes code
it('runs without error', () => {
  myFunction();
});

// ✅ GOOD - Verifies behavior
it('returns correct value', () => {
  expect(myFunction()).toBe(expectedValue);
});
```

## Best Practices

### ✅ DO
- Write tests **before** implementing features (TDD)
- Test edge cases and error conditions
- Mock external dependencies
- Focus on behavior, not implementation

### ❌ DON'T
- Write tests just to hit coverage %
- Test implementation details
- Skip error handling tests
- Ignore warnings in test output

## Need Help?

- 📚 [Full Documentation](./COVERAGE_THRESHOLDS.md)
- 🧪 [Testing Guide](./TESTING.md)
- 🤖 [CI/CD Setup](./GITHUB_ACTIONS_SETUP.md)
- 💬 [Open Discussion](https://github.com/YOUR_ORG/YOUR_REPO/discussions)

---

**Remember**: Coverage thresholds protect code quality. If you can't test code, it might need refactoring! 🛡️
