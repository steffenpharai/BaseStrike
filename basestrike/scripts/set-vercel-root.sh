#!/usr/bin/env bash
# Set Vercel project Root Directory to basestrike (for monorepo) using Vercel CLI + API.
# Run from repo root or basestrike. Uses your Vercel CLI login (--token) or VERCEL_TOKEN.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASESTRIKE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIRECTORY="basestrike"

# Optional: team/org id for PATCH (required for team projects)
TEAM_ID="${VERCEL_ORG_ID:-${VERCEL_TEAM_ID:-}}"

echo "Using Vercel CLI from: $BASESTRIKE_DIR"
cd "$BASESTRIKE_DIR"

# 1) Verify current state with Vercel CLI (no token required if already logged in)
echo ""
echo "Current project settings (vercel project inspect):"
vercel project inspect 2>&1 || true
echo ""

# 2) Set Root Directory via API (CLI has no 'set root' command)
# Token: use VERCEL_TOKEN env, or pass via vercel --token when calling this script
TOKEN="${VERCEL_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "To SET Root Directory to '$ROOT_DIRECTORY', the Vercel CLI cannot do it; the API is required."
  echo "Run with your token (from https://vercel.com/account/tokens):"
  echo "  export VERCEL_TOKEN=\"your-token\""
  echo "  $0"
  echo "Or set in dashboard: Project → Settings → General → Root Directory = basestrike"
  exit 0
fi

# Get project id via Vercel CLI (uses your token)
echo "Resolving project id with: vercel project ls --json"
PROJECT_JSON="$(vercel project ls --json -t "$TOKEN" 2>/dev/null)" || true
if [ -n "$PROJECT_JSON" ]; then
  PROJECT_ID="$(echo "$PROJECT_JSON" | jq -r --arg name "basestrike" '.projects[] | select(.name == $name) | .id // empty' 2>/dev/null)" || true
fi
PROJECT_ID="${PROJECT_ID:-${VERCEL_PROJECT_ID:-prj_BxfyGxMHIPJJ6f2IUpDb1NqiAOsT}}"

if [ -z "$PROJECT_ID" ]; then
  echo "Could not get project id. Set VERCEL_PROJECT_ID or ensure 'vercel project ls' shows basestrike."
  exit 1
fi

echo "Project id: $PROJECT_ID"
echo "Patching Root Directory to: $ROOT_DIRECTORY"

URL="https://api.vercel.com/v9/projects/${PROJECT_ID}"
[ -n "$TEAM_ID" ] && URL="${URL}?teamId=${TEAM_ID}"

RESPONSE="$(curl -s -w "\n%{http_code}" -X PATCH "$URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rootDirectory\":\"$ROOT_DIRECTORY\"}")"
HTTP_CODE="$(echo "$RESPONSE" | tail -n1)"
BODY="$(echo "$RESPONSE" | sed '$d')"

if [ "$HTTP_CODE" = "200" ]; then
  echo "Root Directory set to '$ROOT_DIRECTORY'. Redeploy to apply (e.g. vercel --prod or push to Git)."
else
  echo "PATCH failed (HTTP $HTTP_CODE): $BODY"
  exit 1
fi
