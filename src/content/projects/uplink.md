---
title: Uplink
tagline: Research into giving an AI agent the Unreal Editor — and whether you can trust what it did.
summary: >-
  An experimental Unreal editor plugin exposing editor operations over the Model Context
  Protocol. Run solo as directed research: I set the problem, the requirements and the
  verification, and the implementation was largely AI-written. Disclosed as such throughout.
category: Research project — AI-directed
group: personal
status: experimental
statusLabel: Experimental — pre-1.0, AI-written implementation
order: 4
featured: false

publication:
  approved: true

technologies:
  - Unreal Engine 5.7 and 5.8
  - C++
  - Model Context Protocol
  - HTTP (loopback server)
  - Node.js (optional stdio bridge)
  - PowerShell tooling

diagram: uplink-loop

role: >-
  Solo research project. Mine: the problem, the requirements, the tool design, the
  verification and audits, and the comparison against Epic's own server. Not mine: most of
  the implementation, which was AI-written under that direction.

links:
  - label: LOWSZEHAO/Uplink
    href: https://github.com/LOWSZEHAO/Uplink
    kind: source

statusBreakdown:
  - label: Native MCP server in the editor
    state: done
    note: Loopback-only HTTP, Origin header checked, 2 MB body cap, optional bearer token. Narrower by default than the engine's own experimental server, which ships with no authentication layer.
  - label: Tool surface
    state: done
    note: 120 tools across editor state, Blueprints, assets, Play-In-Editor automation and reflection. Served lazily — a client carries three schemas instead of all of them, about 650 tokens rather than 34,000.
  - label: Cross-version support
    state: done
    note: One codebase compiling against UE 5.7 and 5.8, Win64 editor builds. A regression suite runs clean on the third-person template for both.
  - label: Trustworthiness work
    state: in-progress
    note: Where most of the effort went. Writes run in named editor transactions so they undo by hand; unresolvable object paths are refused rather than written as null; misspelt parameters return a suggestion; truncated lists say so.
  - label: Maturity
    state: not-started
    note: Pre-1.0. The API may still change, and it has mileage on one developer's projects only.
---

## The research question

An agent that can edit your Unreal project is easy to demonstrate and hard to trust. The
interesting question is not "can it author a Blueprint" — it can — but **"can you tell what it
actually did, and undo it?"**

Most of the work went there rather than into new features:

- A tool that writes runs inside its **own named editor transaction**, so its edits roll back
  with Ctrl+Z exactly like a hand edit.
- An object path that resolves to nothing is **refused**, instead of being quietly written as
  null and discovered three steps later.
- A misspelt parameter comes back with a **suggestion**, rather than being ignored.
- Lists **say when they were cut short**, instead of looking complete.
- Tools publish what they are: whether they run caller-named code, whether they need a live
  play session, whether they routinely take a while. A client can weigh a call before making
  it.

Eleven tools opt out of transactions on purpose — all of them drive a play session rather than
editing the project, and the engine does not record changes to a play world.

## The loop it is trying to close

```
understand  →  author  →  run  →  observe  →  assert  →  repair
     ↑                                                      │
     └──────────────────────────────────────────────────────┘
```

Read an unfamiliar project, change it, start it, watch what happens, decide whether that was
right, and fix what was not.

Two limits I would state before anyone asks. Every step is one round trip, so the loop is
**scripted rather than autonomous** — a decided sequence gets replayed, but something still
decides each move. And nothing here plays your game: an agent can drive a character and read
the result, but working out what a player *would* do next is a different problem.

## Evaluating it against the engine's own server

Unreal 5.8 ships a first-party MCP server, experimental and off by default. Comparing the two
properly is the part of this project I would most want to be asked about, because it is the
part where my own conclusions were wrong first.

An earlier version of my write-up claimed Epic's server could not author a Blueprint event
graph. That was wrong. I had grepped the C++ toolsets — but several of Epic's are written in
**Python**, registered into the same registry the server reads, including a 74 KB Blueprint
toolset and a 114 KB S-expression DSL that writes and compiles a whole graph. A second
claim, that it injected no input at all, was wrong the same way: it injects at the Slate
layer, which a grep for `PlayerController` or `EnhancedInput` cannot find.

I corrected both in the repository rather than quietly deleting them. Where Epic is ahead, I
say so: their UMG tooling does tree surgery mine does not, they ship a Gameplay Ability
System toolset and I do not, and Niagara and PCG are far deeper there — 56 Niagara tools
against 9.

The two genuine gaps I found, checked against the 5.8 source in both languages:

- **It cannot drive a pawn.** No possession, no console exec, no waiting assertion.
- **There is no reflection escape hatch.** No arbitrary UFUNCTION call, and no dotted
  property path from an actor into a component's structs.

That whole exercise is the research output, more than the plugin is.
