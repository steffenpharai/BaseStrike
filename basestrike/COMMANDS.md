# Command Reference

Quick reference for all BaseRift commands.

## Setup

```bash
# Install dependencies
npm install

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Optional: install contract dependencies (only if packages/contracts exists)
# cd packages/contracts && forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Copy environment file (from basestrike/)
cp .env.example .env.local
```

## Development

```bash
# Start dev server (http://localhost:3000)
npm run dev
```

### Cursor Browser (mobile size)

1. Start the dev server: `npm run dev` (from `basestrike/`).
2. In Cursor: **Terminal → Run Task…** (or `Ctrl+Shift+P` → “Tasks: Run Task”).
3. Choose **Open in Cursor Browser (Mobile)**.
4. The built-in Simple Browser opens at `http://localhost:3000`.
5. **Resize the browser panel** to **430px width** for mobile view (iPhone 16 Pro Max / Pixel 10 Pro). Drag the panel edge or make the panel narrow so the viewport is ~430px.

```

```bash
# Or open external browser at mobile viewport (Playwright Chromium)
npm run open:mobile

# Build
npm run build

# Format code
npm run format
```

## Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run contract tests
npm run contracts:test

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Smart Contracts

```bash
# Test contracts
cd packages/contracts
forge test

# Test with coverage
forge coverage

# Test with gas report
forge test --gas-report

# Deploy to Base Sepolia
export DEPLOYER_PRIVATE_KEY=<key>
export MINTER_ADDRESS=<address>
export METADATA_BASE_URI=<uri>
npm run contracts:deploy

# Or manually
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base-sepolia \
  --broadcast \
  --verify

# Deploy to Base Mainnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url base \
  --broadcast \
  --verify
```

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (from basestrike/ or repo root: cd basestrike)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variable
vercel env add KEY_NAME

# View logs
vercel logs

# List deployments
vercel ls

# Promote deployment
vercel promote <deployment-url>
```

## Database (Production)

When migrating to database:

```bash
# Example with Prisma
npm install prisma @prisma/client
npx prisma init
npx prisma migrate dev
npx prisma generate
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Stage changes
git add .

# Commit with conventional commit
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature

# Create PR via GitHub
gh pr create
```

## CI/CD

```bash
# GitHub Actions runs automatically on push
# Manually trigger workflow
gh workflow run ci.yml
```

## Utilities

```bash
# Generate session secret
openssl rand -base64 32

# Generate UUID
node -e "console.log(require('crypto').randomUUID())"

# Check port usage
lsof -i :3000

# Kill process on port
kill -9 $(lsof -t -i:3000)
```

## Troubleshooting

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
npm run clean
rm -rf node_modules
npm install

# Clear Foundry cache
cd packages/contracts
forge clean

# Reinstall Foundry dependencies
rm -rf lib
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Check Node version
node --version

# Switch Node version (with nvm)
nvm use
```

## Environment Variables

```bash
# View current env
printenv | grep MINIAPP

# Set env var for current session
export MINIAPP_DOMAIN=localhost:3000

# Unset env var
unset MINIAPP_DOMAIN

# Load from .env file
set -a
source .env.local
set +a
```

## Package Management

```bash
# Add dependency
npm install <package>

# Add dev dependency
npm install -D <package>

# Update all dependencies
npm update

# Check for outdated packages
npm outdated

# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

## Documentation

```bash
# Generate TypeDoc (if configured)
npx typedoc

# Serve docs locally
npx serve docs
```

## Performance

```bash
# Analyze Next.js bundle (from basestrike/)
npm run build
npx @next/bundle-analyzer

# Lighthouse audit
npx lighthouse http://localhost:3000

# Performance profiling
node --prof .next/standalone/server.js
node --prof-process isolate-*.log > processed.txt
```
