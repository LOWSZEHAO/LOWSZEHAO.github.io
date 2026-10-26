---
title: HIGAN
tagline: Freelance gameplay programming on an Unreal Engine 5 action-game prototype — GAS-driven combat, a data-driven skill-card system, and the battle UI.
summary: >-
  Freelance gameplay programmer on an Unreal Engine 5 action-game proof of concept.
  Character combat built on the Gameplay Ability System, a skill-card system configured
  through Data Assets, and the battle interface in UMG.
category: Freelance — gameplay programming
group: professional
status: released
statusLabel: Delivered — playable prototype
order: 2
featured: true

publication:
  approved: true

technologies:
  - Unreal Engine 5
  - C++
  - Blueprints
  - Gameplay Ability System
  - Data Assets
  - UMG
  - Niagara

role: >-
  Freelance gameplay programmer. Character combat on GAS, the data-driven skill-card
  system, and the battle interface.

cover: projects/higan/combat.jpg
coverAlt: A masked character in the HIGAN prototype, surrounded by green ability effects.

screenshots:
  - src: projects/higan/combat-hud.jpg
    alt: In-game combat against a boss, with the input prompts for light attack, heavy attack, lock on, skill, parry, block, dodge and card draw down the left, and health and mana bars bottom-left.
  - src: projects/higan/card-selection.jpg
    alt: The weapon card selection screen, showing the card "Scorching Pulse" with a power value of 80, its effect text, and the deck of selectable cards along the bottom.

videos:
  - id: fh8NnVoRmhs
    title: HIGAN — gameplay prototype
    poster: projects/higan/combat.jpg
    description: >-
      The playable proof of concept: ability-driven combat, skill cards resolving to their
      Gameplay Abilities, and the battle interface.

links: []
---

## Overview

A freelance contract as gameplay programmer on an Unreal Engine 5 action-game proof of
concept. My work covered three areas: character combat, the skill system that drives it, and
the interface the player uses to pick skills.

This was a team project. What is below is my own contribution; the source is the client's and
is not mine to publish.

## Technical implementation

### Combat built on the Gameplay Ability System

Character combat runs through Unreal's Gameplay Ability System. Each skill is its own
Gameplay Ability, and player input is bound to those abilities so a key press triggers the
matching attack behaviour and animation.

Using GAS rather than bespoke combat code means cost, cooldown and effect application are
handled by a system the engine already provides, instead of being re-implemented per skill.

### Skill cards configured through Data Assets

Skills are authored as Data Assets. Each card carries its power, its mana cost, and a
reference to the Gameplay Ability that implements it.

When a card is played from the deck, the system reads its Data Asset and executes the assigned
ability — animation and Niagara effects included. **Configuration is separated from
implementation:** adding or rebalancing a skill is editing a Data Asset, not writing code, so
a designer can tune the deck without a programmer.

### Battle interface

The battle UI is UMG, driven from C++ and Blueprints: the skill-card display, the mana
readout, and combat status. The work here was less about layout than about the wiring —
keeping the interface in step with the underlying combat and skill-selection state as it
changes.
