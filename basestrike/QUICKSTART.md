# BaseRift Quickstart

Get BaseRift running locally in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or pnpm

## Installation

```bash
# Clone (or use this directory)
cd basestrike

# Install dependencies
npm install

# This will take 2-3 minutes
```

## Configuration

```bash
# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Edit minimal required vars
cat > apps/web/.env.local << EOF
MINIAPP_DOMAIN=localhost:3000
MINIAPP_HOME_URL=http://localhost:3000
MINIAPP_ICON_URL=http://localhost:3000/icon.png
MINIAPP_SPLASH_URL=http://localhost:3000/splash.png
MINIAPP_WEBHOOK_URL=http://localhost:3000/api/webhook

# Dev mode settings
DEV_AUTH_BYPASS=true
NODE_ENV=development

# Will use defaults
SESSION_SECRET=dev-secret-change-in-production
BASE_PAY_TREASURY_ADDRESS=0x0000000000000000000000000000000000000000

# Optional but recommended for full testing
NEYNAR_API_KEY=

NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
EOF
```

## Run Development Server

```bash
# Start Next.js dev server
npm run dev

# Server starts at http://localhost:3000
# Open in browser
```

## Test the App

### 1. Home Page

Open http://localhost:3000

You should see:
- BaseRift title
- Practice Match section with game
- Ranked Queue section

### 2. Manifest

```bash
curl http://localhost:3000/api/manifest | jq
```

Should return valid Mini App manifest.

### 3. Authentication (Dev Mode)

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"token":"dev:123:testuser"}' | jq
```

Should return:
```json
{
  "success": true,
  "user": {
    "fid": 123,
    "username": "testuser"
  },
  "sessionToken": "eyJ..."
}
```

### 4. Game

The game should load automatically on the home page.

Controls:
- **Move**: drag joystick (left side)
- **Shoot**: Left click
- **Plant**: Move to bomb site (A or B)

## Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Lint
npm run lint

# Type check
npm run typecheck
```

## Smart Contracts (Optional)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install contract dependencies
cd packages/contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Run tests
forge test

# Back to root
cd ../..
```

## Next Steps

### Local Development

1. Make changes to code
2. Server auto-reloads
3. Test in browser
4. Write tests
5. Commit

### Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

Quick deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel

# Follow prompts
```

### Integrate with Base

1. Deploy to public URL
2. Generate accountAssociation at https://build.base.org
3. Update env vars
4. Test in Base preview: https://base.dev/preview

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 npm run dev
```

### Dependencies fail to install

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Game doesn't render

- Check browser console for errors
- Try different browser
- Ensure WebGL is supported
- Clear browser cache

### Tests fail

```bash
# Ensure dev server is running for E2E tests
npm run dev

# In another terminal
npm run test:e2e
```

### Manifest not accessible

- Check server is running
- Verify URL: http://localhost:3000/api/manifest
- Check for errors in console
- Verify env vars loaded

## Development Tips

### Hot Reload

Next.js supports fast refresh:
- Save file
- Changes appear in browser
- State preserved

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or set in .env.local
NODE_ENV=development
DEBUG=basestrike:*
```

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Solidity (for contracts)

### Browser DevTools

- React DevTools for component inspection
- Network tab for API calls
- Console for errors and logs
- Performance tab for profiling

## Quick Reference

### Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests

# Contracts
npm run contracts:test      # Test contracts
npm run contracts:deploy    # Deploy contracts

# Code Quality
npm run lint         # Lint code
npm run typecheck    # Type check
npm run format       # Format code
```

### Important URLs

- **Local**: http://localhost:3000
- **Manifest**: http://localhost:3000/api/manifest
- **API Docs**: See README.md
- **Base Docs**: https://docs.base.org/building-with-base/mini-apps

### Environment Variables

Minimal for local development:
- `MINIAPP_DOMAIN`
- `MINIAPP_HOME_URL`
- `MINIAPP_ICON_URL`
- `DEV_AUTH_BYPASS=true`

Required for production:
- All of the above
- `ACCOUNT_ASSOCIATION_*`
- `NEYNAR_API_KEY`
- `SESSION_SECRET`

See `.env.example` for complete list.

## Getting Help

- **Documentation**: See README.md
- **Architecture**: See ARCHITECTURE.md
- **Deployment**: See DEPLOYMENT.md
- **Commands**: See COMMANDS.md
- **Issues**: Create GitHub issue
- **Base Discord**: https://discord.gg/base

## What's Next?

After getting it running:

1. **Read the README**: Comprehensive guide to all features
2. **Explore the code**: Well-structured and documented
3. **Run the tests**: See how everything is tested
4. **Make changes**: Start customizing
5. **Deploy**: Get it live on Vercel
6. **Submit to Base**: Get approved and launch

Enjoy building with BaseRift!
