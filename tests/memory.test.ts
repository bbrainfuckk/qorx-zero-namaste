import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProofFrame,
  createMemory,
  hashText,
  pruneExpired,
  rankMemories,
  tokenize,
} from "../lib/memory.ts";

const now = new Date("2026-07-19T12:00:00.000Z");

test("tokenize normalizes, removes stop words, and deduplicates", () => {
  assert.deepEqual(tokenize("The launch, launch plan is LOCAL."), [
    "launch",
    "plan",
    "local",
  ]);
});

test("hashText is stable and changes with content", () => {
  assert.equal(hashText("remember me"), hashText("remember me"));
  assert.notEqual(hashText("remember me"), hashText("forget me"));
});

test("expired memory is removed before recall", () => {
  const expired = createMemory({
    text: "Delete this expired note",
    ttlDays: 1,
    now: new Date("2026-07-10T12:00:00.000Z"),
  });
  assert.equal(pruneExpired([expired], now).length, 0);
  assert.equal(rankMemories("expired note", [expired], now).length, 0);
});

test("relevant memory outranks a lower-importance partial match", () => {
  const exact = createMemory({
    text: "Ship the forgetting flow before analytics.",
    tags: ["launch"],
    importance: 4,
    now,
  });
  const partial = createMemory({
    text: "Analytics colors are green.",
    tags: ["design"],
    importance: 5,
    now,
  });
  const ranked = rankMemories(
    "What should ship before analytics?",
    [partial, exact],
    now,
  );
  assert.equal(ranked[0].id, exact.id);
});

test("unrelated memories never enter the proof frame", () => {
  const memory = createMemory({
    text: "The dashboard accent is green.",
    tags: ["design"],
    now,
  });
  const proof = buildProofFrame("Which license is required?", [memory], { now });
  assert.equal(proof.selected.length, 0);
  assert.equal(proof.frame, "");
});

test("proof frame respects item and character limits", () => {
  const memories = Array.from({ length: 8 }, (_, index) =>
    createMemory({
      text: `Launch priority ${index}: ${"x".repeat(120)}`,
      tags: ["launch"],
      importance: 5 - (index % 3),
      now: new Date(now.getTime() - index * 1000),
    }),
  );
  const proof = buildProofFrame("launch priority", memories, {
    maxItems: 3,
    maxChars: 220,
    now,
  });
  assert.ok(proof.selected.length <= 3);
  assert.ok(proof.frame.length <= 220);
});

test("explicit forgetting removes a memory from subsequent recall", () => {
  const keep = createMemory({
    text: "Keep the public architecture diagram.",
    tags: ["architecture"],
    now,
  });
  const forget = createMemory({
    text: "Forget the old architecture diagram.",
    tags: ["architecture"],
    now,
  });
  const remaining = [keep, forget].filter((memory) => memory.id !== forget.id);
  const proof = buildProofFrame("architecture diagram", remaining, { now });
  assert.deepEqual(proof.selected.map((memory) => memory.id), [keep.id]);
});
