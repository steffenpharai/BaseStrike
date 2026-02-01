# Contributing to BaseRift

Thank you for your interest in contributing to BaseRift!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run tests: `npm test`
7. Commit: `git commit -m "feat: your feature"`
8. Push: `git push origin feature/your-feature`
9. Create Pull Request

## Code Standards

### TypeScript

- Use strict mode
- Define types for all functions
- No `any` types
- Use Zod for runtime validation

### React

- Functional components only
- Use hooks
- Client components marked with "use client"
- Server components by default

### Testing

- Unit tests for all utilities
- E2E tests for user flows
- Contract tests for all functions
- Aim for >80% coverage

### Commits

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactor
- `chore:` - Maintenance

## Pull Request Process

1. Update README if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG
5. Request review
6. Address feedback
7. Squash commits if requested

## Architecture Guidelines

### Adding New Features

1. Define types in `packages/shared`
2. Add Zod schemas for validation
3. Implement server logic in `apps/web/lib`
4. Create API route in `apps/web/app/api`
5. Add React components
6. Write tests
7. Update documentation

### Adding Game Features

1. Update game types in `packages/game/src/types.ts`
2. Add constants to `packages/shared/src/constants.ts`
3. Implement in `GameScene.ts`
4. Update server logic in `match-server.ts`
5. Test locally

### Adding Smart Contract Features

1. Write Solidity in `packages/contracts/src`
2. Add tests in `packages/contracts/test`
3. Run `forge test`
4. Update deployment script
5. Document in README

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test("should load page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
```

### Contract Tests

```solidity
function testFeature() public {
    assertEq(value, expected);
}
```

## Questions?

Open an issue or ask in Discord.
