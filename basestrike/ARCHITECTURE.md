# BaseStrike Architecture

Complete architectural overview of the BaseStrike Mini App.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Base App (iOS/Android)                   │
│  - Renders Mini App in WebView                                  │
│  - Provides context (user, platform)                            │
│  - Handles Base Pay transactions                                │
│  - Sends webhook events                                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BaseStrike Web App (Vercel)                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Next.js App │  │  API Routes  │  │ Static Assets│         │
│  │              │  │              │  │              │         │
│  │ - Pages      │  │ - Auth       │  │ - Manifest   │         │
│  │ - Components │  │ - Webhook    │  │ - Images     │         │
│  │ - Game UI    │  │ - Payment    │  │ - Icons      │         │
│  │              │  │ - Replay     │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘         │
│         │                  │                                     │
│         ▼                  ▼                                     │
│  ┌─────────────────────────────────────────┐                   │
│  │         Game Engine (Phaser)            │                   │
│  │  - Rendering                            │                   │
│  │  - Input handling                       │                   │
│  │  - Client-side prediction               │                   │
│  └─────────────────────────────────────────┘                   │
│                                                                  │
│  ┌─────────────────────────────────────────┐                   │
│  │       Match Server (Authoritative)      │                   │
│  │  - Game state management                │                   │
│  │  - Action validation                    │                   │
│  │  - Hit detection                        │                   │
│  │  - Replay generation                    │                   │
│  └─────────────────────────────────────────┘                   │
└────────────┬────────────────────────┬────────────────────────────┘
             │                        │
             │ RPC Calls              │ Notifications
             ▼                        ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Base Blockchain    │  │   Neynar API         │
│                      │  │                      │
│ - Cosmetics ERC-1155 │  │ - Webhook Verify     │
│ - Payment Settlement │  │ - Push Notifications │
└──────────────────────┘  └──────────────────────┘
```

## Component Architecture

### Frontend (`apps/web/app`)

```
app/
├── page.tsx                    # Home page (entry point)
├── HomePage.tsx                # Client component with game
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── replay/
│   └── [id]/
│       ├── page.tsx            # Server component with metadata
│       └── ReplayPage.tsx      # Client component
└── api/
    ├── auth/
    │   └── route.ts            # Quick Auth verification
    ├── webhook/
    │   └── route.ts            # Base app webhook handler
    ├── payment/
    │   └── verify/
    │       └── route.ts        # Base Pay verification
    ├── replay/
    │   └── [id]/
    │       ├── route.ts        # Replay data
    │       └── image/
    │           └── route.tsx   # Dynamic OG image
    └── manifest/
        └── route.ts            # Mini app manifest
```

### Backend Libraries (`apps/web/lib`)

```
lib/
├── config.ts                   # Environment config
├── minikit.config.ts           # Manifest generator
├── auth/
│   └── quickauth.ts            # Quick Auth implementation
├── notifications/
│   ├── store.ts                # Token storage (in-memory)
│   └── sender.ts               # Notification sender
├── payments/
│   └── basepay.ts              # Base Pay integration
└── game/
    ├── match-server.ts         # Authoritative game server
    └── replay-store.ts         # Replay storage
```

### Game Package (`packages/game`)

```
game/src/
├── index.ts                    # Game factory
├── GameScene.ts                # Main game scene
├── map.ts                      # Map data & collision
└── types.ts                    # Game types
```

### Shared Package (`packages/shared`)

```
shared/src/
├── index.ts                    # Exports
├── schemas.ts                  # Zod schemas
└── constants.ts                # Game constants
```

### Smart Contracts (`packages/contracts`)

```
contracts/
├── foundry.toml                # Foundry config
├── src/
│   └── BaseStrikeCosmetics.sol # ERC-1155 cosmetics
├── test/
│   └── BaseStrikeCosmetics.t.sol
└── script/
    └── Deploy.s.sol            # Deployment script
```

## Data Flow

### Authentication Flow

```
1. User opens app in Base App
   ↓
2. Client detects Mini App context
   ↓
3. Client calls sdk.quickAuth.getToken()
   ↓
4. SDK returns JWT token
   ↓
5. Client POSTs token to /api/auth
   ↓
6. Server verifies JWT with Quick Auth
   ↓
7. Server creates session token
   ↓
8. Client stores session token
```

### Payment Flow

```
1. User clicks "Pay to Enter Ranked"
   ↓
2. Client calls Base Pay SDK
   ↓
3. Base App shows payment UI
   ↓
4. User confirms transaction
   ↓
5. Transaction submitted to Base
   ↓
6. Client receives txHash
   ↓
7. Client POSTs receipt to /api/payment/verify
   ↓
8. Server stores receipt
   ↓
9. Server authorizes match entry
```

### Notification Flow

```
1. User adds app in Base App
   ↓
2. Base App POSTs webhook to /api/webhook
   ↓
3. Server verifies signature
   ↓
4. Server stores notification token
   ↓
5. Server responds 200 (< 3s)
   ↓
6. Base App activates token
   ↓
7. Later: Server sends notification
   ↓
8. Base App delivers to user
```

### Game Flow

```
1. Client creates game instance
   ↓
2. Phaser initializes canvas
   ↓
3. Client sends actions to server
   ↓
4. Server validates actions
   ↓
5. Server updates authoritative state
   ↓
6. Server broadcasts state to clients
   ↓
7. Clients render state
   ↓
8. Match ends
   ↓
9. Server generates replay
   ↓
10. Client shows replay link
```

### Replay Flow

```
1. Server generates replay JSON
   ↓
2. Server stores in replay-store
   ↓
3. User shares /replay/[id]
   ↓
4. Server renders metadata
   ↓
5. Frame image generated dynamically
   ↓
6. Base App/Farcaster renders embed
   ↓
7. User clicks "Open App"
   ↓
8. App opens to replay page
```

## State Management

### Client State

- **React State**: UI state, form inputs
- **Phaser State**: Game rendering state
- **Session Storage**: Session token
- **No Global State**: Keep components independent

### Server State

- **In-Memory Maps**: Current implementation
  - Match state
  - Replay storage
  - Notification tokens
  - Payment receipts

- **Production Migration**: Replace with:
  - **Postgres**: Persistent data (users, matches, replays)
  - **Redis**: Session state, real-time data
  - **S3**: Replay JSON files, images

## Security Architecture

### Authentication

```
┌─────────────┐
│   Client    │
│             │
│ 1. Get JWT  │──────┐
│    from SDK │      │
└─────────────┘      │
                     ▼
              ┌──────────────┐
              │  Quick Auth  │
              │   Verifier   │
              │              │
              │ - Verify JWT │
              │ - Check domain│
              └──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Session Token│
              │   (HS256)    │
              └──────────────┘
```

### Payment Security

```
┌─────────────┐
│   Client    │
│             │
│ Base Pay SDK│
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Base Chain  │
│ Transaction │
└─────┬───────┘
      │ txHash
      ▼
┌─────────────┐
│   Server    │
│             │
│ 1. Store   │
│ 2. Verify* │
│ 3. Authorize│
└─────────────┘

*In production: Verify on-chain via RPC
```

### Webhook Security

```
┌─────────────┐
│  Base App   │
│             │
│ 1. Sign     │
│    payload  │
└─────┬───────┘
      │ + signature
      ▼
┌─────────────┐
│  /webhook   │
│             │
│ 2. Verify   │──────┐
│    signature│      │
└─────────────┘      │
                     ▼
              ┌──────────────┐
              │ Neynar API   │
              │              │
              │ verifyAppKey │
              └──────────────┘
```

## Scaling Considerations

### Current Limitations

- In-memory storage (not distributed)
- Single server instance
- No persistent WebSocket connections
- No player matchmaking
- No leaderboards

### Scaling Path

#### Phase 1: Database Migration

```
Replace in-memory stores:
- Postgres for matches, replays, users
- Redis for sessions, live state
- S3 for replay files
```

#### Phase 2: WebSocket Server

```
Separate WebSocket server:
- Socket.io or ws
- Redis adapter for clustering
- Room-based matchmaking
- Tick-based state sync
```

#### Phase 3: Distributed Architecture

```
- Load balancer (Vercel Edge)
- Multiple API instances
- Dedicated game servers
- Redis Cluster
- CDN for static assets
```

#### Phase 4: Microservices

```
Services:
- Auth service
- Match service
- Replay service
- Notification service
- Payment service

Communication:
- REST APIs
- Message queue (RabbitMQ)
- gRPC for internal
```

## Performance Optimization

### Frontend

- Code splitting by route
- Lazy load Phaser
- Dynamic imports for heavy components
- Image optimization (WebP)
- Font optimization
- Service Worker for assets

### Backend

- API route caching
- Database query optimization
- Connection pooling
- Rate limiting
- Compression (gzip/brotli)

### Game

- Object pooling
- Delta updates only
- Client-side prediction
- Server reconciliation
- Network optimization (binary protocol)

## Monitoring & Observability

### Metrics to Track

- Request latency (p50, p95, p99)
- Error rates
- Active matches
- Concurrent users
- Payment success rate
- Notification delivery rate
- Game tick rate
- Client FPS

### Logging

- Structured logs (JSON)
- Log levels (debug, info, warn, error)
- Request IDs for tracing
- Error stack traces
- User actions

### Alerting

- Error rate > threshold
- Response time > threshold
- Failed payments
- Webhook failures
- Contract events

## Disaster Recovery

### Backup Strategy

- Database snapshots (daily)
- Contract state (immutable)
- S3 versioning for replays
- Code in Git

### Recovery Procedures

1. **Database corruption**: Restore from snapshot
2. **API down**: Vercel auto-recovers or promote previous deployment
3. **Contract bug**: Deploy new version, migrate data
4. **Data loss**: Restore from backup

## Development Workflow

```
Feature Development:
1. Create feature branch
2. Implement in local env
3. Write tests
4. Run test suite locally
5. Push to GitHub
6. CI runs all tests
7. Deploy to preview (Vercel)
8. Manual testing
9. Create PR
10. Code review
11. Merge to main
12. Auto-deploy to production
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Phaser 3
- **State**: React Hooks

### Backend
- **Runtime**: Node.js 18
- **API**: Next.js API Routes
- **Validation**: Zod
- **Auth**: Jose (JWT)
- **WebSocket**: ws (planned)

### Smart Contracts
- **Language**: Solidity 0.8.23
- **Framework**: Foundry
- **Testing**: Forge
- **Standards**: ERC-1155

### Infrastructure
- **Hosting**: Vercel
- **Database**: In-memory (migrate to Postgres)
- **Blockchain**: Base Sepolia/Mainnet
- **CDN**: Vercel Edge Network

### Developer Tools
- **Monorepo**: Turborepo
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Vitest, Playwright, Forge
- **CI/CD**: GitHub Actions
