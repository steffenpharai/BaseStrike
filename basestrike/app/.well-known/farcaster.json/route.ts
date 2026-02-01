import { withValidManifest } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "@/minikit.config";

/** Serves manifest at https://your-domain.com/.well-known/farcaster.json (Base docs Step 3–5). */
export async function GET() {
  return Response.json(withValidManifest(minikitConfig));
}
