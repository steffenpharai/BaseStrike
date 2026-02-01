# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster Mini App built with Next.js 15, OnchainKit, and the Farcaster MiniApp SDK. It's a web3-enabled application that runs inside Warpcast, allowing users to interact with blockchain features (wallet management, transactions, swaps) within the Farcaster ecosystem.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file (configure API keys)
```

### Development
```bash
npm run dev                   # Start development server (http://localhost:3000)
npm run build                 # Build for production
npm start                     # Start production server
npm run lint                  # Run ESLint checks
```

### Important: No test suite is currently configured in this project.

## Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Web3**: OnchainKit (@coinbase/onchainkit) + wagmi + viem
- **Chain**: Base (Coinbase L2)
- **Farcaster**: @farcaster/miniapp-sdk for MiniKit integration
- **State**: @tanstack/react-query for server state management
- **Styling**: CSS Modules + Global CSS with auto dark mode

### Key Architecture Patterns

**Provider Hierarchy** (`app/rootProvider.tsx`):
The entire app is wrapped in `OnchainKitProvider` which configures:
- API key authentication (Coinbase Developer Platform)
- Base chain connection
- Wallet display preferences (modal mode, all wallet types)
- MiniKit enablement with auto-connect

**MiniApp Lifecycle** (`app/page.tsx`):
All client components must call `setMiniAppReady()` after mounting to signal to Warpcast that the app has loaded. This is critical for proper MiniApp functioning.

**Authentication Flow** (optional):
1. User opens app in Warpcast MiniApp context
2. Frontend calls `useQuickAuth("/api/auth")` to verify identity
3. Farcaster SDK auto-injects `Authorization: Bearer <jwt>` header
4. Backend (`/app/api/auth/route.ts`) verifies JWT and extracts FID
5. FID (Farcaster ID) can be used to fetch user data or authorize actions

Note: Authentication is optional. Basic user data is available via `useMiniKit().context?.user` without verification.

### Directory Structure

```
app/
├── api/                      # API routes (Next.js server endpoints)
│   └── auth/route.ts         # Farcaster JWT verification endpoint
├── .well-known/              # Standard web configs
│   └── farcaster.json/       # MiniApp manifest endpoint (serves minikit.config.ts)
├── page.tsx                  # Main entry point (client component)
├── layout.tsx                # Root layout with metadata
├── rootProvider.tsx          # OnchainKit + MiniKit provider wrapper
├── globals.css               # Global styles
└── page.module.css           # Component-scoped styles

public/                       # Static assets served at root
├── icon.png, splash.png      # MiniApp branding (referenced in minikit.config.ts)
├── hero.png, screenshot.png  # OG images and screenshots
└── sphere.svg                # Animated sphere (main page visual)

minikit.config.ts             # MiniApp manifest configuration
```

### Environment Variables

Required:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Get from https://portal.cdp.coinbase.com/products/onchainkit

Recommended:
- `NEXT_PUBLIC_URL` - Your deployed URL (auto-detected on Vercel via VERCEL_URL)

Optional:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - For WalletConnect support
- `NEXT_PUBLIC_ALCHEMY_API_KEY` - For enhanced RPC performance

### MiniApp Manifest Configuration

The `minikit.config.ts` file defines the app's metadata for Farcaster:
- App name, description, icons, screenshots
- Primary category and tags (affects discoverability)
- URLs for home, webhooks, and OG tags
- Account association and builder metadata

This config is served at `/.well-known/farcaster.json` and must follow the [Farcaster Mini App spec](https://docs.base.org/mini-apps/features/manifest).

### OnchainKit Components

The app includes links to OnchainKit components that can be added:
- **Transaction** - Execute on-chain transactions
- **Swap** - Token swapping interface
- **Checkout** - Payment flows
- **Wallet** - Connect wallet UI (already implemented in header)
- **Identity** - User identity and ENS resolution

All components are pre-styled and chain-aware (Base network).

### Next.js Configuration

**Webpack Externals** (`next.config.ts`):
The following packages are externalized to avoid bundling issues:
- `pino-pretty` - Logging library
- `lokijs` - Database library
- `encoding` - Text encoding utilities

This is required for proper wagmi/viem functionality.

### Code Style

**ESLint Configuration** (eslint.config.mjs):
- Flat config format (ESLint 9+)
- Extends `next/core-web-vitals` and `next/typescript`
- Unused variables allowed with underscore prefix (`_unused`)
- Strict TypeScript checking enabled

**TypeScript**:
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` maps to project root

## Common Development Patterns

### Adding a New Page
1. Create `app/your-page/page.tsx`
2. Export default function component
3. Use `"use client"` directive if using hooks or interactivity
4. Access via `http://localhost:3000/your-page`

### Accessing User Data
```typescript
// Option 1: Get basic user info (no verification)
const { context } = useMiniKit();
const userFid = context?.user?.fid;

// Option 2: Verify user identity via JWT
const { data, isLoading, error } = useQuickAuth<{ userFid: string }>("/api/auth");
```

### Using OnchainKit Components
All OnchainKit components require the `OnchainKitProvider` wrapper (already configured in `rootProvider.tsx`). Simply import and use:
```typescript
import { Transaction } from "@coinbase/onchainkit/transaction";
// Use in JSX
```

## Deployment

This app is optimized for Vercel deployment:
1. Environment variables are auto-detected (VERCEL_URL, VERCEL_ENV)
2. No additional configuration needed
3. Update `NEXT_PUBLIC_URL` to your production domain
4. Ensure OnchainKit API key is set in Vercel environment variables
