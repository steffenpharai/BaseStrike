# Deployment Guide

Complete step-by-step deployment guide for BaseStrike.

## Prerequisites

- Vercel account
- Domain (optional, can use Vercel domain)
- Base Build account
- Neynar API key
- Wallet with Base Sepolia ETH

## Step 1: Local Testing

```bash
# Install dependencies
npm install

# Install Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install contract dependencies
cd packages/contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cd ../..

# Set up env
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local with dev settings
# MINIAPP_DOMAIN=localhost:3000
# MINIAPP_HOME_URL=http://localhost:3000
# DEV_AUTH_BYPASS=true

# Run dev server
npm run dev

# In another terminal, run tests
npm run lint
npm run typecheck
npm test

# Run contract tests
npm run contracts:test
```

## Step 2: Deploy Smart Contracts

```bash
cd packages/contracts

# Get Base Sepolia ETH from faucet
# https://faucet.base.org/

# Set environment variables
export DEPLOYER_PRIVATE_KEY=<your-private-key>
export MINTER_ADDRESS=<backend-wallet-address>
export METADATA_BASE_URI=https://your-domain.com/metadata/

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY

# Save contract address
export COSMETICS_CONTRACT_ADDRESS=<deployed-address>
```

## Step 3: Set Up Vercel

### 3.1 Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd apps/web
vercel link

# Set root directory to "apps/web" in Vercel dashboard
```

### 3.2 Configure Environment Variables

In Vercel dashboard or via CLI:

```bash
# Domain (use your Vercel domain or custom domain)
vercel env add MINIAPP_DOMAIN
# Enter: your-app.vercel.app

vercel env add MINIAPP_HOME_URL
# Enter: https://your-app.vercel.app

vercel env add MINIAPP_ICON_URL
# Enter: https://your-app.vercel.app/icon.png

vercel env add MINIAPP_SPLASH_URL
# Enter: https://your-app.vercel.app/splash.png

vercel env add MINIAPP_WEBHOOK_URL
# Enter: https://your-app.vercel.app/api/webhook

# Neynar API Key
vercel env add NEYNAR_API_KEY
# Enter: your-neynar-key (get from https://neynar.com)

# Session Secret
vercel env add SESSION_SECRET
# Enter: $(openssl rand -base64 32)

# Base Pay
vercel env add BASE_PAY_TREASURY_ADDRESS
# Enter: your-treasury-wallet-address

# Contracts
vercel env add COSMETICS_CONTRACT_ADDRESS
# Enter: <from step 2>

vercel env add MINTER_PRIVATE_KEY
# Enter: <backend-signer-private-key>

# Network
vercel env add NEXT_PUBLIC_CHAIN_ID
# Enter: 84532

vercel env add NEXT_PUBLIC_RPC_URL
# Enter: https://sepolia.base.org

# Environment
vercel env add NODE_ENV
# Enter: production

vercel env add DEV_AUTH_BYPASS
# Enter: false
```

### 3.3 Initial Deploy

```bash
# Deploy
vercel --prod

# Wait for deployment
# Note the deployment URL
```

## Step 4: Generate Account Association

### 4.1 Via Base Build Tool

1. Go to https://build.base.org/
2. Sign in with wallet
3. Click "Register App"
4. Enter app details:
   - Name: BaseStrike
   - Domain: your-app.vercel.app
   - Description: Tactical shooter mini app
5. Follow signing flow in wallet
6. Copy generated values:
   - Header
   - Payload
   - Signature

### 4.2 Add to Vercel

```bash
vercel env add ACCOUNT_ASSOCIATION_HEADER
# Paste header value

vercel env add ACCOUNT_ASSOCIATION_PAYLOAD
# Paste payload value

vercel env add ACCOUNT_ASSOCIATION_SIGNATURE
# Paste signature value
```

### 4.3 Redeploy

```bash
vercel --prod
```

## Step 5: Verify Deployment

### 5.1 Check Manifest

```bash
curl https://your-app.vercel.app/.well-known/farcaster.json | jq
```

Should return valid manifest with all fields.

### 5.2 Test API Routes

```bash
# Manifest
curl https://your-app.vercel.app/api/manifest

# Auth (with dev token)
curl -X POST https://your-app.vercel.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"token":"dev:123:test"}'
```

### 5.3 Test in Browser

1. Open https://your-app.vercel.app
2. Verify page loads
3. Check for errors in console
4. Test game renders

## Step 6: Test in Base Dev Preview

1. Go to https://base.dev/preview
2. Enter your app URL: https://your-app.vercel.app
3. Verify manifest loads
4. Test context detection
5. Test all features

## Step 7: Set Up Webhook Testing

### 7.1 Create Test Event

Use Neynar CLI or create test webhook:

```bash
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "x-farcaster-signature: test-signature" \
  -d '{
    "type": "miniapp_added",
    "timestamp": 1234567890,
    "data": {
      "fid": 123,
      "appFid": 456,
      "notificationToken": "test-token",
      "notificationUrl": "https://api.base.org/notifications"
    }
  }'
```

### 7.2 Check Logs

```bash
vercel logs
```

Verify webhook processed successfully.

## Step 8: E2E Testing

```bash
# Set test environment
export BASE_URL=https://your-app.vercel.app

# Run E2E tests
npm run test:e2e
```

## Step 9: Submit to Base

1. Go to https://build.base.org/
2. Submit your app for review
3. Provide:
   - App URL
   - Screenshots
   - Description
   - Test instructions
4. Wait for approval

## Step 10: Production Launch

### 10.1 Switch to Mainnet (Optional)

```bash
# Update environment variables
vercel env add NEXT_PUBLIC_CHAIN_ID
# Enter: 8453

vercel env add NEXT_PUBLIC_RPC_URL
# Enter: https://mainnet.base.org

# Redeploy contracts to Base Mainnet
cd packages/contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify

# Update contract address
vercel env add COSMETICS_CONTRACT_ADDRESS
# Enter: <new-mainnet-address>

# Redeploy
vercel --prod
```

### 10.2 Monitor

- Set up Vercel monitoring
- Configure error tracking (Sentry)
- Set up analytics
- Monitor webhook calls
- Track payment receipts

## Rollback Plan

### Quick Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Full Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-deploys
```

## Troubleshooting

### Manifest not loading

- Check Vercel rewrites in `vercel.json`
- Verify CORS headers
- Test with curl
- Check env vars loaded

### Webhook verification fails

- Check Neynar API key
- Verify signature format
- Test with valid signature
- Check webhook URL accessible

### Game not rendering

- Check build logs for errors
- Verify Phaser bundle size
- Test WebGL support
- Check CSP headers

### Authentication fails

- Verify domain matches env var
- Check Quick Auth SDK version
- Test with mock token first
- Verify HTTPS in production

### Payment verification fails

- Check treasury address
- Verify network (testnet/mainnet)
- Test Base Pay SDK
- Check RPC endpoint

## Post-Deployment

### Database Migration

Replace in-memory stores with database:

1. Set up Postgres (Vercel Postgres, Supabase, etc.)
2. Replace stores in `lib/`:
   - `notifications/store.ts`
   - `game/replay-store.ts`
   - `payments/basepay.ts`
3. Run migrations
4. Test thoroughly

### CDN for Assets

1. Upload images to CDN
2. Update manifest URLs
3. Configure caching headers

### Rate Limiting

Add rate limiting to sensitive endpoints:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### Monitoring

Set up:
- Vercel Analytics
- Sentry error tracking
- Custom metrics dashboard
- Webhook event logging
- Payment tracking

## Checklist

- [ ] Contracts deployed and verified
- [ ] Vercel project created
- [ ] All env vars configured
- [ ] Account association generated
- [ ] Initial deployment successful
- [ ] Manifest accessible
- [ ] API routes working
- [ ] Game renders correctly
- [ ] Webhook tested
- [ ] E2E tests passing
- [ ] Tested in Base preview
- [ ] Submitted to Base
- [ ] Monitoring configured
- [ ] Database migrated (if needed)
- [ ] CDN configured (if needed)
- [ ] Rate limiting added
- [ ] Documentation updated

## Support

- Vercel: https://vercel.com/support
- Base: https://discord.gg/base
- Neynar: https://docs.neynar.com/
