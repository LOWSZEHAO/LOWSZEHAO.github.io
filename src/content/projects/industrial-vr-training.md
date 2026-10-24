---
title: Industrial VR Safety Training
tagline: Unreal Engine VR training that turns industrial safety procedures into something a trainee performs, and is assessed on.
summary: >-
  Professional work at VirtualX: VR training modules covering work at height, construction
  lifting operations, casualty handling and collapsed-structure rescue. Four recorded
  modules below, published with client identities and internal implementation withheld.
category: Professional work
group: professional
status: released
statusLabel: Professional work at VirtualX
order: 1
featured: true

publication:
  approved: true

technologies:
  - Unreal Engine 5
  - C++
  - Blueprint
  - OpenXR
  - Meta Quest (Android standalone)
  - Windows PC VR
  - Spatial UI
  - HTTP / REST integration

role: >-
  VR Developer (R&D) at VirtualX. I build these simulations, engineer and maintain the
  reusable C++ XR framework components and interaction systems underneath them, and do the
  OpenXR troubleshooting across PC VR and standalone headsets.

cover: projects/vr-training/worksite-safety.jpg
coverAlt: First-person view in VR of a gloved hand attaching a carabiner to a ladder rung, with an on-screen instruction reading "Attach on ladder".

videos:
  - id: L2fUpbcsDbw
    title: Worksite Safety — working at height
    poster: projects/vr-training/worksite-safety.jpg
    description: >-
      Fall-arrest procedure. The trainee attaches their harness line to the ladder by hand,
      with the attachment point highlighted and the current step stated in world space.
  - id: 4yxLiXFV6vc
    title: Construction Safety — lifting operation
    poster: projects/vr-training/construction-safety.jpg
    description: >-
      A crane lifting operation on a live construction site, with rigging, load and
      exclusion-zone handling driven from a spatial action panel.
  - id: hziNDMfayQ8
    title: Safety Rescue — casualty handling
    poster: projects/vr-training/safety-rescue-casualty.jpg
    description: >-
      Immobilising and securing a casualty on a spine board: splint placement, strapping
      order, and step-by-step prompts the trainee works through in sequence.
  - id: xd4EOLDB8_0
    title: Safety Rescue — collapsed structure
    poster: projects/vr-training/safety-rescue-collapse.jpg
    description: >-
      Casualty extraction from a collapsed structure, with debris, restricted access and a
      stretcher carry through the scene.

links: []
---

## Overview

This is my professional work: Unreal Engine VR training simulations built at VirtualX, where
industrial Standard Operating Procedures become something a trainee carries out with their
hands rather than reads about.

The four modules below cover work at height, construction lifting operations, casualty
handling, and rescue from a collapsed structure. They are recorded from the running
applications.

## Problem and goals

These procedures share a shape: **dangerous, expensive or impractical to rehearse on the
real equipment**, with consequences in the field that training exists to prevent. You cannot
drop a load off a crane to show someone why the exclusion zone matters. You cannot practise
extracting a casualty from a collapsed building on a real collapsed building.

VR is a good answer to that specific problem and a poor answer to most others. What matters
is not that the environment looks real. It is that the **procedure** is real: right steps,
right order, the trainee's own hands doing the work, and a record of whether they got it
right.

That constraint shapes everything downstream. A door that behaves slightly differently each
time is a texture in a game. In training it is a defect: a procedure that cannot reproduce
exactly cannot be validated or assessed.

## What the modules do

Across all four, the same systems are doing the work:

- **Step-driven procedure.** The current instruction is stated in world space — *"Attach on
  ladder"*, *"Attach at the victim's injured leg"* — and the trainee advances by performing
  it, not by clicking past it.
- **Guidance that points without doing the work for you.** Attachment points are highlighted
  and direction markers show where the next action belongs. How much guidance appears is the
  difference between a walkthrough and an assessment.
- **Hand interaction with the real equipment.** Carabiners, harness lines, splints, straps,
  spine boards, rigging — each behaving the way the physical object does, or the muscle memory
  it builds is the wrong one.
- **Spatial UI.** Action panels and step navigation placed in the world, legible at VR
  resolution and reachable without leaving the task.
- **Two platforms.** Windows PC VR and Android standalone headsets — a very different
  performance budget for the same content.

## My role

I am a VR Developer (R&D) at VirtualX, and have been since March 2024. On this work I:

- Build the simulations themselves — translating the written procedure into interactive,
  assessable training.
- Engineer and maintain the **reusable C++ XR framework components and interaction systems**
  underneath them, so each new module extends a shared layer rather than restarting from the
  template.
- Implement simulation logic, training workflows and the interactive scenarios that have to
  match the operational procedure they teach.
- Do the technical R&D and OpenXR troubleshooting across Windows PC VR and Android standalone
  headsets.
- Contribute the HTTP/API integration, session management and application data-tracking that
  turn a run into a record of what the trainee actually did.

This is team work at a company, not a solo project. What I claim here is my own contribution;
I am happy to be specific about which systems were mine in an interview, including the parts
that were not.

## What is not on this page, and why

The recordings are here. The following deliberately are not:

- **Client identities.** These modules were built for specific industrial clients. Naming them
  is not mine to do.
- **Source code and the company's internal framework architecture.** It is my employer's, not
  mine to publish, regardless of how much of it I wrote.
- **Anything commercially sensitive** — scope, commercial terms, internal systems.
