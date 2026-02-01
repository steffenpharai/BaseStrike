# Command Reference

Quick reference for all BaseStrike commands.

## Setup

```bash
# Install dependencies
npm install

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install contract dependencies
cd packages/contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cd ../..

# Copy environment file
cp apps/web/.env.example apps/web/.env.local
```

## Development

```bash
# Start dev server (http://localhost:3000)
npm run dev

# Build all packages
npm run build

# Clean all builds
npm run clean

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

# Link project
cd apps/web
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
rm -rf apps/web/.next

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
source apps/web/.env.local
set +a
```

## Package Management

```bash
# Add dependency to workspace
npm install <package> -w apps/web

# Add dev dependency
npm install -D <package> -w apps/web

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
# Analyze Next.js bundle
cd apps/web
npm run build
npx @next/bundle-analyzer

# Lighthouse audit
npx lighthouse http://localhost:3000

# Performance profiling
node --prof apps/web/server.js
node --prof-process isolate-*.log > processed.txt
```
