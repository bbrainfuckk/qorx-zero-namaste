# Architecture

Qorx Zero has one boundary: the full memory store stays in the browser.

    ┌──────────────────────────── User device ────────────────────────────┐
    │ Write memory → IndexedDB → transparent ranker ← current question   │
    │                         ↓                                           │
    │             expiry + explicit forgetting                           │
    │                         ↓                                           │
    │            ≤5 record / ≤1600 char proof frame                      │
    │                         ↓                                           │
    │           visible selected records + source hashes                 │
    └─────────────────────────┬───────────────────────────────────────────┘
                              ↓
                   POST /api/ask → input guard
                              ↓
                       GPT-5.6 Terra
                              ↓
                      evidence-gated answer

## Memory record

Each record contains an ID, text, tags, importance, creation time, last-use
time, optional expiry time, and a deterministic source hash.

There are no embeddings, remote vector databases, or hidden retrieval services
in this Hackathon Edition. That keeps the behavior inspectable and the runtime
footprint small.

## Forgetting

Forgetting has two paths:

1. The user presses **Forget**, which deletes the IndexedDB record immediately.
2. A TTL expires, which removes the record before ranking.

Both paths are covered by automated tests and the companion notebook.

## Provider gate

The server route rejects oversized questions and proof frames. It chooses the
provider from server configuration, not from untrusted browser input. The model
is instructed to use only the proof frame and identify missing evidence.
