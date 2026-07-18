export type MemoryItem = {
  id: string;
  text: string;
  tags: string[];
  importance: number;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string | null;
  sourceHash: string;
};

export type RankedMemory = MemoryItem & {
  score: number;
  matchedTerms: string[];
};

export type ProofFrame = {
  frame: string;
  selected: RankedMemory[];
  fullChars: number;
  frameChars: number;
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how",
  "i", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to",
  "must", "should", "we", "what", "when", "where", "which", "who", "will",
  "with",
]);

export function tokenize(value: string): string[] {
  return Array.from(
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
    ),
  );
}

export function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function isExpired(memory: MemoryItem, now = new Date()): boolean {
  return memory.expiresAt !== null && new Date(memory.expiresAt) <= now;
}

export function pruneExpired(
  memories: MemoryItem[],
  now = new Date(),
): MemoryItem[] {
  return memories.filter((memory) => !isExpired(memory, now));
}

export function rankMemories(
  query: string,
  memories: MemoryItem[],
  now = new Date(),
): RankedMemory[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  return pruneExpired(memories, now)
    .map((memory) => {
      const memoryTerms = new Set(tokenize(`${memory.text} ${memory.tags.join(" ")}`));
      const matchedTerms = queryTerms.filter((term) => memoryTerms.has(term));
      const relevance = matchedTerms.length / queryTerms.length;
      const ageDays = Math.max(
        0,
        (now.getTime() - new Date(memory.lastUsedAt).getTime()) / 86_400_000,
      );
      const recency = Math.exp(-ageDays / 30);
      const importance = Math.min(5, Math.max(1, memory.importance)) / 5;
      const score = relevance * 0.65 + importance * 0.2 + recency * 0.15;
      return { ...memory, score, matchedTerms };
    })
    .filter((memory) => memory.matchedTerms.length > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.importance - left.importance ||
        right.lastUsedAt.localeCompare(left.lastUsedAt),
    );
}

export function buildProofFrame(
  query: string,
  memories: MemoryItem[],
  options: { maxItems?: number; maxChars?: number; now?: Date } = {},
): ProofFrame {
  const maxItems = options.maxItems ?? 5;
  const maxChars = options.maxChars ?? 1600;
  const ranked = rankMemories(query, memories, options.now);
  const selected: RankedMemory[] = [];
  const lines: string[] = [];

  for (const memory of ranked) {
    if (selected.length >= maxItems) break;
    const line = `- [${memory.sourceHash}; importance=${memory.importance}] ${memory.text}`;
    const candidate = [...lines, line].join("\n");
    if (candidate.length > maxChars) {
      const remaining = maxChars - (lines.join("\n").length + (lines.length ? 1 : 0));
      if (remaining > 48) {
        lines.push(`${line.slice(0, Math.max(0, remaining - 1))}…`);
        selected.push(memory);
      }
      break;
    }
    lines.push(line);
    selected.push(memory);
  }

  const frame = lines.join("\n");
  return {
    frame,
    selected,
    fullChars: pruneExpired(memories, options.now).reduce(
      (total, memory) => total + memory.text.length,
      0,
    ),
    frameChars: frame.length,
  };
}

export function createMemory(input: {
  text: string;
  tags?: string[];
  importance?: number;
  ttlDays?: number | null;
  now?: Date;
}): MemoryItem {
  const now = input.now ?? new Date();
  const text = input.text.trim();
  const tags = (input.tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const ttlDays = input.ttlDays ?? null;
  return {
    id: `${now.getTime().toString(36)}-${hashText(`${text}:${now.toISOString()}`)}`,
    text,
    tags,
    importance: Math.min(5, Math.max(1, input.importance ?? 3)),
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    expiresAt:
      ttlDays && ttlDays > 0
        ? new Date(now.getTime() + ttlDays * 86_400_000).toISOString()
        : null,
    sourceHash: hashText(text),
  };
}
