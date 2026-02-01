#!/bin/bash

# BaseRift - Local Development Quick Start
# Run this script to get BaseRift running locally

set -e

echo "🎮 BaseRift - Local Setup"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Setup environment
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚙️  Setting up environment..."
    cat > apps/web/.env.local << 'ENVEOF'
MINIAPP_DOMAIN=localhost:3000
MINIAPP_HOME_URL=http://localhost:3000
MINIAPP_ICON_URL=http://localhost:3000/icon.png
MINIAPP_SPLASH_URL=http://localhost:3000/splash.png
MINIAPP_WEBHOOK_URL=http://localhost:3000/api/webhook

DEV_AUTH_BYPASS=true
NODE_ENV=development

SESSION_SECRET=dev-secret-change-in-production
BASE_PAY_TREASURY_ADDRESS=0x0000000000000000000000000000000000000000

NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
ENVEOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
echo ""

echo "🚀 Starting development server..."
echo ""
echo "Server will start at: http://localhost:3000"
echo ""
echo "Controls:"
echo "  - Move: drag joystick (left side)"
echo "  - Shoot: Left click"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
