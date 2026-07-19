# Qorx Zero

**Memory that stays with the work.**

Qorx Zero is a standalone, device-local memory layer for AI work. It keeps
project decisions in the browser, retrieves only the relevant records, builds
an inspectable proof frame, and sends that bounded frame—not the full memory
store—to the configured model.

**Live demo:** https://bbrainfuckk.github.io/qorx-zero-namaste/

**Demo video:** https://youtu.be/NjWIGFTAFok

This repository is the clean-room **NamasteDev Hackathon Edition**. It is a
complete application and does not contain or depend on private Qorx source,
compiler code, binaries, or datasets.

## What the demo proves

- Persistent cross-session memory in IndexedDB
- Transparent relevance + recency + importance ranking
- User-controlled TTL and immediate forgetting
- A hard cap on proof-frame records and characters
- Evidence-gated answers with source hashes
- OpenAI Responses API adapter for gpt-5.6-terra
- A usable local proof preview when no server key is configured

## Run it

Requirements: Node.js 22.13 or newer.

    npm ci
    npm test
    npm run dev

Open the local URL printed by Vinext.

`npm run build:pages` creates the dependency-free public demo build used by
GitHub Pages. It keeps the full IndexedDB and proof-gating flow and falls back
to the local proof preview when no server-side provider is available.

To enable the live provider response, copy .env.example to .env.local and set a
new server-side key:

    QORX_ZERO_PROVIDER=openai
    OPENAI_API_KEY=replace_me
    OPENAI_MODEL=gpt-5.6-terra

Keys are read only by /api/ask. Never put a provider key in browser code or
commit it to Git.

## Architecture

    User decision → IndexedDB on device
    Current question + local records → transparent ranker
    Ranker → TTL and explicit forgetting → capped proof frame
    Proof frame → server provider adapter → verified answer

The ranker uses standard, inspectable signals:

    score = 0.65 × keyword overlap + 0.20 × importance + 0.15 × recency

Only records sharing a non-stop-word term with the current question are
eligible. The default proof frame is limited to five records and 1,600
characters.

## Validation

    npm run check

The companion notebook at notebooks/qorx_zero_memory_validation.ipynb
independently validates ranking, expiry, forgetting, and proof caps with
synthetic data.

## Submission material

- [Architecture](docs/ARCHITECTURE.md)
- [Three-minute demo script](docs/DEMO_SCRIPT.md)
- [Recorded demo voiceover](docs/DEMO_VOICEOVER.txt)
- [Pitch deck](docs/Qorx-Zero-Pitch-Deck.pptx)
- [NamasteDev submission copy](docs/SUBMISSION_NAMASTE.md)
- [Public/private IP boundary](docs/IP_BOUNDARY.md)
- [Build log](docs/BUILD_LOG.md)

## License

GNU Affero General Public License v3.0. See [LICENSE](LICENSE).
