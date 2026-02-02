/**
 * Moltbot game-update contributions store.
 * In production, replace with a database for persistence and human review dashboard.
 */

export type ContributionType = "balance" | "map" | "config";

export interface ContributionEntry {
  id: string;
  type: ContributionType;
  payload: Record<string, unknown>;
  agentId?: string;
  matchIds?: string[];
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reviewedAt?: number;
}

const store = new Map<string, ContributionEntry>();

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `contrib_${Date.now()}_${idCounter}`;
}

export function addContribution(entry: Omit<ContributionEntry, "id" | "status" | "createdAt">): ContributionEntry {
  const id = nextId();
  const record: ContributionEntry = {
    ...entry,
    id,
    status: "pending",
    createdAt: Date.now(),
  };
  store.set(id, record);
  return record;
}

export function getContribution(id: string): ContributionEntry | undefined {
  return store.get(id);
}

export function listContributions(status?: ContributionEntry["status"]): ContributionEntry[] {
  const list = Array.from(store.values());
  if (status) return list.filter((c) => c.status === status);
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export function setContributionStatus(
  id: string,
  status: "approved" | "rejected"
): ContributionEntry | null {
  const c = store.get(id);
  if (!c || c.status !== "pending") return null;
  c.status = status;
  c.reviewedAt = Date.now();
  return c;
}
