#!/usr/bin/env bash
# Set Vercel project Root Directory to basestrike (for monorepo).
# Requires VERCEL_TOKEN. Get one: https://vercel.com/account/tokens
# Or set in dashboard: Project → Settings → General → Root Directory = basestrike

set -e
PROJECT_ID="${VERCEL_PROJECT_ID:-prj_BxfyGxMHIPJJ6f2IUpDb1NqiAOsT}"
TEAM_ID="${VERCEL_ORG_ID:-team_Rhs9CaYpWahAZabTQf3BdYuk}"

if [ -z "${VERCEL_TOKEN}" ]; then
  echo "VERCEL_TOKEN not set. Set it or configure Root Directory in Vercel dashboard:"
  echo "  Project basestrike → Settings → General → Root Directory = basestrike"
  exit 1
fi

curl -s -X PATCH \
  "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"basestrike"}' | head -20

echo ""
echo "If no error above, Root Directory is set to basestrike. Redeploy to apply."
