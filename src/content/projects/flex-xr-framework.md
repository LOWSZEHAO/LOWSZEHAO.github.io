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
order: 2
featured: true
publication:
  approved: true
technologies:
  - C++
  - Unreal Engine 5.8
  - OpenXR
  - Meta Quest 3 (Android)
  - Enhanced Input
  - Unreal Automation Tests
  - Editor component visualizers
  - Python (editor tooling)
  - GitHub Actions
  - Git LFS
role: >-
  Sole author. Architecture, all C++, the architecture decision records, the automation
  tests, and the Quest standalone bring-up.
diagram: flexxr-modules
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
modules and strictly one-way dependencies. It is my own project, and it is the piece of work
I would most want to be interviewed about.

The design bet is that **one interaction layer can serve two markets that normally get
separate codebases**: step-based industrial procedure training, and higher-fidelity VR
gameplay. Training sits *on top of* the interaction layer and only observes it, so a game
simply never loads it. That separation is enforced in each module's `Build.cs` rather than by
convention — nothing lower in the stack can reference anything above it, and the build fails
if it tries.

Three of six phases are finished and confirmed working in a headset. The framework also runs
on Quest 3 standalone, built, packaged and installed. It is not finished, and the status table
above says exactly which parts are which.

## Problem and goals

Every VR project I had worked on rebuilt the same things: grabbing, doors and levers,
teleporting, highlighting what you can touch. Each rebuild made the same decisions slightly
differently, and the result felt different every time. Reusable interaction components are
worth building because interaction *feel* is the part of VR that is hardest to get right and
easiest to get subtly wrong — and because, for training specifically, feel is not cosmetic.

The goals that shaped the architecture:

- **One interaction layer, two products.** Avoid the usual fork between a training codebase
  and a gameplay codebase.
- **Determinism.** Procedure training needs validation, scoring and replay. An interaction
  that reproduces exactly is a prerequisite for all three.
- **Zero per-object setup.** Dropping a component on a mesh should be the whole job. The
  single largest bug class in VR projects is a mesh with the wrong collision preset.
- **No interaction may assume an input device.** Tracked hands, motion controllers and a
  desktop mouse simulator all go through the same path.
- **A device build closes every phase.** Quest is a target, not a port to do later.

## My role

Sole author. I designed the module architecture and wrote all of it: the C++, the
architecture document, the ten decision records, the automation tests, and the Quest
standalone bring-up — including diagnosing the two platform bugs below.

There is no team contribution to disentangle here, and nothing in the repository was generated
for me. The decision records are the clearest evidence of how I work: each one states the
obvious Unreal approach, why it was rejected, what was accepted instead, and what the reversal
path is.

## Technical implementation

### A deterministic constraint solver instead of physics constraints

The conventional Unreal approach to a hand-driven door or lever is a
`UPhysicsConstraintComponent` plus a physics handle pulling the body toward the hand. I
rejected it (ADR-001). At 90 Hz it jitters, limits overshoot, constraints occasionally
explode, hands shove doors through walls, and — fatally for training — it is not
deterministic.

What the solver does instead, while an object is held:

1. **Project** the interactor's position onto the constraint manifold. For a hinge that is one
   scalar: what angle around my axis does the hand correspond to? Hand-to-pivot distance falls
   out of the maths, so real leverage comes for free.
2. Run that target through a **feel model** — inertia and damping for perceived weight,
   resistance curves, detent wells, state springs for levers.
3. Drive the body with `SetKinematicTarget` rather than a raw transform write, so a moving
   door still pushes physics bodies and characters correctly.

On release, tracked velocity is handed off: doors to a damped swing integrator, levers to a
state spring, free props to full simulation with inherited velocity.

The accepted trade is explicit. A held object does not physically resist world geometry the
way a fully simulated body would, and two simultaneously-held constrained bodies are not
physically resolved. In exchange the behaviour is identical on PCVR and Quest, cheap enough
for the mobile tier, and *authored* rather than emergent — which means it is tunable. The
solver is plain C++ operating on transforms behind a thin `UObject` wrapper, which is also
what makes it unit-testable without a world.

### Registry-based detection rather than overlap events

Interactables auto-register into a world subsystem backed by a spatial hash (ADR-002). Each
frame the hand's grab sphere queries the registry against **activation radii** the components
declare, and a scored narrow phase picks a winner by distance, approach angle, hand side,
designer priority and enabled state.

The reason this beats `OnComponentBeginOverlap` is mostly about feel: the detection primitive
is the grip point's activation radius, not the render mesh. A tiny pin gets a generous grab
radius; a large door does not light up at its far corner. It also removes per-object collision
configuration entirely, and gives a deterministic iteration order — overlap events fire
unpredictably, and SOP replay cannot tolerate that.

One custom trace channel is reserved for work that genuinely needs mesh accuracy: ray
targeting, fingertip probes, procedural grip.

### An extension contract with no interface

There is deliberately no `IFXR_Interactable` interface (ADR-003). The base class's virtual
lifecycle — `CanBegin / OnBegin / OnUpdate / OnEnd` — *is* the extension contract, and
subclassing it inherits registration, highlighting, enable semantics and event emission.

The evidence that this works across a module boundary rather than only internally is
`UFXR_ClimbHold`, which lives in `FXR_Locomotion`: a higher module added an entirely new
interactable type without touching `FXR_Interaction`.

### Highlighting that encodes state, not appearance

The highlight subsystem binds three styles to *semantic states*, never to appearances.
Training says "highlight this, Guidance state" and never learns what Guidance looks like.

The outline has two implementations behind one API. On PC it reads a packed custom-depth
stencil in a single full-screen pass; on mobile it swaps to an inverted hull mesh, because a
full-screen post-process pass is a Quest frame-budget killer. Because one pass serves every
outlined object it can never read a per-object colour, so the stencil carries the *state* —
and that is precisely what lets hover and guidance differ. `Auto` resolves on feature level,
so the editor's mobile preview shows the Quest path without a Quest.

### Locomotion that moves the play space, not the pawn

In room-scale VR the player physically walks inside their guardian, so the headset sits at an
arbitrary offset from the pawn root. The naive teleport — `SetActorLocation` on the pawn —
moves the root to the target, which lands the player's *head* somewhere else entirely. Players
consistently end up beside, behind or inside the thing they aimed at.

Teleport therefore moves the play-space origin so the headset's horizontal position lands on
the target (ADR-006). All modes live in one component with a mode arbiter, not one per mode
(ADR-005): teleport, smooth move, turn and climbing all have to arbitrate with each other,
and separate components would each need to know about the others.

## Key engineering challenges

**Stereo was silently collapsed on Quest.** The first device build rendered an identical image
to both eyes. Multi-view was enabled and the engine logs agreed, so every usual check looked
healthy. The cause was the mobile **deferred** shading path, whose lighting pass is the one
mobile pass that never sets `RenderTargets.MultiViewCount` — so with multi-view on, the
lighting pass resolves one view and both eyes receive it. Nothing warns. The fix is one
setting, `r.Mobile.ShadingPath=0`, and finding it meant reading the renderer source rather
than the logs.

**None of the plugin's own content shipped.** Every framework material and mesh is addressed
through a soft object path built from a string literal in C++, which leaves the cooker no
dependency edge to follow. All eleven assets were absent from the first APK — so the mobile
highlight tier could not have worked on device either. They cannot be hard references,
because a rooted asset makes the material regeneration script assert and take the editor
down with it, so the folders are named in `DirectoriesToAlwaysCook` instead. I have recorded
this as a known flaw rather than a fix: it ships correctly only because *this project* names
those folders. Drop the plugin into another project and you get no ray, no reticle, no
outline hull, and no error explaining why.

**A grab that silently overwrote authored scale.** A grip point beneath a mesh inherits that
mesh's scale. Taking the relative transform of the grip pose against the held object divides
the scale by itself and yields a unit-scale offset — which would then overwrite the object's
authored size on every grab. Grab never writes scale now, handled centrally rather than
guarded at each call site.

**Parked physics that could never fall again.** Anything that parks an object kinematic has to
notify the grab component, or the next grab reads the parked body, records "never simulated",
and the object can never fall after release. That one bit twice before it was fixed properly.

## Testing and verification

- **Automation tests** cover the constraint solver, including a determinism test: an identical
  input sequence must produce identical transform output. That test is what underpins the
  claim that SOP replay is possible at all.
- **The solver and scoring logic are plain C++** — plain structs and pure functions behind a
  thin `UObject` wrapper — specifically so they can be exercised without creating a world.
- **A device build closes every phase from 2 onward.** That rule is what caught both Quest
  bugs above; neither produced an error, and neither was visible on PC.
- **The Quest 3 smoke test passed on 8 October 2026** — built, packaged, installed, and
  interaction confirmed working and smooth in-headset on Android 14.
- **GitHub Actions** runs checks on push.
- Verification without a headset is documented too: listing the packaged archive confirms all
  eleven plugin assets shipped, and extracting the cooked ini shows which renderer settings
  actually made it into the build. A headless launch proves nothing about rendering, because
  the proximity sensor suspends the app before the renderer initialises.

## Current status and limitations

Three phases complete, phase 3 in progress, phases 4 to 6 not started. Beyond that, the
things I would raise myself in an interview:

- **Candidate-selection hysteresis is documented but never implemented.** The architecture
  document describes a sticky-best score bonus; the code does not have one. All hysteresis in
  the codebase is on input thresholds. Highlight flicker between two adjacent objects is
  therefore a real gap, and the scoring-policy seam is its natural home.
- **The scoring policy is marked `Blueprintable` but its scoring method is a plain C++
  virtual**, not a `UFUNCTION`. A Blueprint subclass compiles and its override is never
  called, which is worse than not being extensible from Blueprint at all. It should either
  drop the specifier or be made properly overridable.
- **The guidance arrow needs manual wiring per step.** A design exists to have it follow the
  highlight subsystem's guidance call automatically, so one call drives both the glow and the
  arrow. It is not built.
- **The plugin is not self-contained for packaging**, as described above. Worth fixing before
  any 1.0 claim.
- **A black tearing artifact at the outer edge of the right eye on Quest** is open and accepted
  as minor. It only appears where a high-contrast silhouette crosses that region, which is the
  signature of a shading-rate or reconstruction artifact rather than geometry or lighting.
  Foveated rendering has been ruled out from device logs rather than inferred; image-based
  variable-rate shading is the next candidate, and there is a documented way to A/B it on
  device without repackaging.
- **PCVR and Quest will not agree on brightness**, and chasing parity is the wrong goal. The
  cause is the mobile renderer and the device profile's post-process cuts, not the level. If
  the device needs to be brighter it should be tuned for the device.
- **There are no demo recordings yet.** The repository's architecture diagrams are real; the
  gameplay clips are not recorded, and this page does not pretend otherwise.

## Next steps

1. Close phase 3 — merge the current branch and tag it. Everything built is verified; what
   remains was deliberately deferred.
2. Phase 4, the SOP step graph and a fire-safety demo. The validation panel and spatial UI kit
   belong inside that phase, where a real consumer defines what they need, rather than being
   guessed at now.
3. Phase 5, the performance study, on a device that already runs.

Phases 4 and 5 are the two that matter most for this portfolio: a training demo built entirely
on the framework, and a performance case study, are what would prove the original thesis
rather than describe it.
