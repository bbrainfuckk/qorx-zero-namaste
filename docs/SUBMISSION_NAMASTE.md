# NamasteDev submission copy

## Project name

Qorx Zero

## One line

Keep project memory on your device and send only the proof needed for the
current task.

## What we built

Qorx Zero is a local-first memory layer for AI work. It persists decisions in
the browser, recalls relevant records across sessions, supports automatic and
explicit forgetting, and exposes the exact proof frame sent to the model.

The prototype is deliberately inspectable. Its ranking combines keyword
overlap, recency, and user-set importance. Unrelated records never enter the
proof frame. A strict record and character cap prevents the full memory store
from leaking into a request.

## Who it is for

Developers, students, and small teams who repeatedly re-explain project context
to AI tools but do not want a remote service to own their entire memory store.

## How AI is used

The server adapter uses the OpenAI Responses API with GPT-5.6 Terra. The model
receives the current question and the visible proof frame, with instructions to
refuse unsupported claims and cite source hashes. Codex with GPT-5.6 was used
to implement, test, review, and document this Hackathon Edition.

## Built with

Codex, GPT-5.6 Terra, OpenAI Responses API, React, Vinext, IndexedDB,
Cloudflare Workers-compatible runtime, Node.js test runner.

## Submission links

- Live demo: https://bbrainfuckk.github.io/qorx-zero-namaste/
- Public repository: https://github.com/bbrainfuckk/qorx-zero-namaste
- Demo video: https://youtu.be/NjWIGFTAFok
- Pitch deck: https://github.com/bbrainfuckk/qorx-zero-namaste/blob/main/docs/Qorx-Zero-Pitch-Deck.pptx
