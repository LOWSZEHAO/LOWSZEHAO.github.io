---
title: FlexXR Framework
tagline: A modular C++ XR interaction framework for Unreal Engine 5.8. One interaction layer, serving both industrial training and VR gameplay.
summary: >-
  My own Unreal Engine plugin providing reusable XR interaction: grabbing, constrained
  mechanisms, locomotion and highlighting, behind one deterministic solver. Three of six
  phases are complete and verified in-headset, including a Quest 3 standalone build.
category: Personal engineering project
group: personal
status: in-progress
statusLabel: In progress — phase 3 of 6
order: 3
featured: true
publication:
  approved: true
technologies:
  - C++
  - Unreal Engine 5.8
  - OpenXR
  - Meta Quest 3 (Android)
  - Enhanced Input
  - Editor component visualizers
  - Git LFS
role: >-
  Sole author. Architecture, the decision records, the automation tests, and the Quest
  standalone bring-up.
cover: projects/flex-xr/interaction-demo.jpg
coverAlt: First-person view in VR of two articulated hands in the grey-box test level, with a ladder, rock face and a table of props.
diagram: flexxr-modules
videos:
  - id: nDhgd4uIlW0
    title: FlexXR — early interaction demo
    poster: projects/flex-xr/interaction-demo.jpg
    description: >-
      An early development build in the grey-box test level, not a polished showcase: hand
      presence, grabbing, a constrained latch, two-handed grip points, and climbing.
links:
  - label: LOWSZEHAO/Flex_XR_Framework
    href: https://github.com/LOWSZEHAO/Flex_XR_Framework
    kind: source
    note: Public for review.
statusBreakdown:
  - label: Phase 1 — FXR_Core
    state: done
    note: Pawn and rig, the interactor contract, input mapping, device capability detection, event bus, mixed-reality mode flags.
  - label: Phase 2 — Interaction core
    state: done
    note: Registry detection, the constraint solver with automation tests, Grab, Latch and Press, grip points and hand poses, editor gizmos. Verified in-headset.
  - label: Phase 2.5 — FXR_Locomotion
    state: done
    note: Teleport with arc and validation, room-scale origin handling, smooth move, snap and smooth turn, comfort vignette, anchors and blockers, climbing. Verified in-headset.
  - label: Phase 3 — FXR_UI and presentation
    state: in-progress
    note: Focus and highlight subsystems, far-ray pointer, sockets, distance grab, guidance arrow and the shared motion settings are built and confirmed in-headset. The spatial UI kit and the author-time validation panel are not.
  - label: Phase 4 — FXR_Training
    state: not-started
    note: The SOP step graph is designed and recorded in ADR-004, with a fire-safety demo planned. No code yet.
  - label: Phase 5 — Optimisation and Quest tier
    state: not-started
    note: The framework already runs on Quest 3 standalone, so this is optimisation on a device that works rather than a port. No formal performance study yet.
  - label: Phase 6 — Mixed reality and game demo
    state: not-started
    note: Mode flags and an anchor abstraction exist in FXR_Core from day one; passthrough and plane detection are not implemented.
  - label: Ghost-hand grip guidance
    state: dropped
    note: Considered and rejected. Grip points already snap the hand into the right pose, so it would demonstrate something that happens anyway — and a trainee shown the exact grip has not been assessed on knowing it.
---

## Overview

FlexXR is a C++ interaction framework for Unreal Engine 5.8, built as one plugin with six
modules and strictly one-way dependencies. It is my own project.

The design bet: one interaction layer serving two markets that normally get separate
codebases — step-based industrial training, and higher-fidelity VR gameplay. Training sits on
top of interaction and only observes it, so a game never loads it. That separation is
enforced in each module's `Build.cs`, not by convention.

## Problem and goals

Every VR project rebuilds the same things: grabbing, doors and levers, teleporting,
highlighting. Each rebuild decides slightly differently, and the result feels different every
time.

What shaped the architecture:

- **Determinism.** Training needs validation, scoring and replay. An interaction that
  reproduces exactly is a prerequisite for all three.
- **Zero per-object setup.** Dropping a component on a mesh should be the whole job. The
  largest bug class in VR projects is a mesh with the wrong collision preset.
- **No interaction assumes an input device.** Tracked hands, controllers and a desktop mouse
  simulator share one path.
- **A device build closes every phase.** Quest is a target, not a port to do later.

## My role

Sole author. Architecture, the ten decision records, the automation tests, and the Quest
standalone bring-up.

## Technical implementation

### Deterministic solver, not physics constraints

The conventional approach to a hand-driven door is a `UPhysicsConstraintComponent` plus a
physics handle. I rejected it (ADR-001): at 90 Hz it jitters, limits overshoot, and it is not
deterministic.

The solver instead projects the hand onto the constraint manifold, runs that target through a
feel model — inertia, damping, detents — and drives the body with `SetKinematicTarget`. On
release, tracked velocity hands off to a damped integrator, a state spring, or full
simulation.

The trade is explicit: a held object does not physically resist world geometry. In exchange
the behaviour is identical on PCVR and Quest, and *authored* rather than emergent, so it is
tunable. The solver is plain C++ behind a thin wrapper, which makes it testable without a
world.

### Registry-based detection, not overlap events

Interactables auto-register into a world subsystem backed by a spatial hash (ADR-002). Each
frame the hand's grab sphere queries it against activation radii the components declare.

The detection primitive is the grip point's radius, not the render mesh: a tiny pin gets a
generous grab radius, a large door does not light up at its far corner. It removes per-object
collision setup entirely, and gives a deterministic iteration order that overlap events
cannot.

### No interactable interface

There is deliberately no `IFXR_Interactable` (ADR-003). The base class's virtual lifecycle —
`CanBegin / OnBegin / OnUpdate / OnEnd` — *is* the contract.

The evidence it works across a module boundary: `UFXR_ClimbHold` lives in `FXR_Locomotion`, a
higher module that added a new interactable type without touching `FXR_Interaction`.

### Highlighting encodes state, not appearance

Three styles bound to semantic states, never to appearances. Training says "highlight this,
Guidance state" and never learns what Guidance looks like.

Two implementations sit behind one API: a packed custom-depth stencil on PC, an inverted hull
mesh on mobile, because a full-screen post-process pass is a Quest frame-budget killer. One
pass serves every outlined object, so it can never read a per-object colour — the stencil
carries the state instead.

### Locomotion moves the play space, not the pawn

In room-scale VR the headset sits at an arbitrary offset from the pawn root, so
`SetActorLocation` lands the player's *head* somewhere else. Teleport moves the play-space
origin so the headset lands on the target (ADR-006).

All modes live in one component with a mode arbiter (ADR-005), because teleport, smooth move,
turn and climbing all have to arbitrate with each other.

## Key engineering challenges

### Stereo was silently collapsed on Quest

The first device build rendered the same image to
both eyes. Multi-view was on and the logs agreed. The cause was the mobile *deferred* shading
path, whose lighting pass is the one mobile pass that never sets
`RenderTargets.MultiViewCount`. Nothing warns. One setting fixed it, and finding it meant
reading the renderer source.

### None of the plugin's own content shipped

Every framework material is addressed through a
soft object path built from a string literal, which leaves the cooker no dependency edge to
follow. All eleven assets were absent from the first APK. They cannot be hard references, so
the folders are named in `DirectoriesToAlwaysCook` instead. I record that as a known flaw
rather than a fix: it works only because *this project* names those folders.

### A grab that silently overwrote authored scale

A grip point beneath a mesh inherits that
mesh's scale, so the relative transform divides the scale by itself and yields a unit-scale
offset. Grab never writes scale now, handled centrally rather than guarded at each call site.
