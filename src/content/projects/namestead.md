---
title: Namestead
tagline: An Unreal editor plugin. Define a correct asset name once, then rename, validate and audit a whole project from that one definition.
summary: >-
  A commercial editor plugin, released on Fab for Unreal Engine 5.6 to 5.8. Composable
  rename rules with a live preview, the same rules enforced through the engine's Data
  Validation, whole-project health reports, and headless commandlets for a build step.
category: Developer tools — commercial product
group: personal
status: released
statusLabel: Released — v1.0.0 on Fab
order: 3
featured: true
publication:
  approved: true
technologies:
  - C++
  - Unreal Engine 5.4 – 5.8
  - Slate editor UI
  - Engine Data Validation
  - Asset Registry / IAssetTools
  - Commandlets (headless)
  - Unreal Automation Tests
  - PowerShell build and test automation
  - Fab distribution
role: >-
  Sole author. Product design, the Slate panel, the test suite, the documentation, and the
  Fab submission.
cover: projects/namestead/panel-preview.png
coverAlt: The Namestead panel showing a rename preview, with each asset's current name, proposed name and status.
links:
  - label: Namestead on Fab
    href: https://www.fab.com/listings/eb29d253-a430-4bcc-80e3-cbad5e36e0c4
    kind: store
  - label: Full documentation
    href: https://lowszehao.github.io/namestead-docs/#getting-started
    kind: docs
statusBreakdown:
  - label: Rename with live preview
    state: done
    note: Composable rules over a selection or a folder, with collision checking and a count of what a rename would also rewrite.
  - label: Rule library
    state: done
    note: Twelve rule types, order dependent, each receiving the name the previous rule produced. Three preset chains ship built in code rather than as assets.
  - label: Run history and reverse
    state: done
    note: Every run is recorded to CSV automatically, and any run can be loaded back in reverse as an ordinary preview — resolved against the project as it stands now, not as the report remembers it.
  - label: Project-wide validation
    state: done
    note: The same rule chain saved as the project's convention, enforced through the engine's own Data Validation — so it runs in the Validate Assets action and in the DataValidation commandlet on a build machine.
  - label: Project health report
    state: done
    note: Five categories in one pass, with percentages only where there is something honest to divide by.
  - label: Audit and organize commandlets
    state: done
    note: Headless naming, unreferenced, empty-folder, duplicate-import and organization reports, with CSV output and exit codes a build step can act on.
  - label: Platforms
    state: in-progress
    note: Win64 only, because it has never been run on a macOS or Linux editor. There is no platform-specific code in it — that restriction is a statement about what has been tested, not about what works.
---

## Overview

Large Unreal projects drift. Names stop matching whatever convention they started with, assets
end up in the wrong folders, and nothing notices until someone goes looking. Unreal ships a
batch renamer that does the mechanical part and knows nothing about what *correct* means for
your project.

Namestead starts from one idea: **define what a correct name and location look like once, as a
chain of rules**. That one definition then does three jobs — bulk rename with a live preview,
project-wide enforcement through the engine's own Data Validation, and whole-project
reporting — all of it runnable headless, with CSV output and exit codes a build step can act
on. Nothing is renamed until it has been previewed.

Released on Fab for Unreal Engine 5.6, 5.7 and 5.8.

## Problem and goals

A bulk rename tool is easy to write badly. The naive version is a string transformation plus a
loop calling rename, and it has three problems:

1. **It cannot tell you what is about to happen.** Renaming a referenced asset repoints
   everything that points at it — assets that were never in your selection.
2. **Some renames destroy data.** In Unreal, a rename that changes only letter case is one.
3. **The definition of "correct" lives only in the tool.** Rename today, drift again next
   month, with nothing enforcing the convention in between.

The goals that followed:

- Name generation must be **incapable** of modifying an asset.
- Every refusal must be visible with its reason, not quietly dropped.
- The same rules must work as a project-wide convention and from a build machine.
- The whole rule layer must be testable without creating assets.

## My role

Sole author. Product design, the Slate panel, the validation and safety behaviour, the test
suite, the documentation site, and the Fab submission.

The source is not public: it is a commercial product. This case study is written to stand on
its own, from the published documentation and behaviour.

## Technical implementation

The pipeline is split so the dangerous half is small and late:

```
Selection → Rule chain → Proposed names → Validation → Preview → Execution
            (pure)                        (registry)             (IAssetTools)
```

Name generation is separate from execution, so **building a preview cannot modify an asset** —
not as a matter of care, but of structure. Execution goes through `IAssetTools::RenameAssets`
rather than touching `.uasset` files, which leaves redirectors and reference fix-up to the
engine.

### The rule layer is pure, and that is what makes it testable

Every rule implements one method:

```cpp
virtual FString Apply(const FNamesteadRuleContext& Context) const;
```

The context carries the original name, the name so far, the asset's class, its folder and its
index in the batch. A rule has **no access** to the asset registry, the filesystem, or a
`UObject`. That is why the largest part of the plugin can be exercised without creating a
single asset, and why the test suite runs anywhere, headless included.

Twelve rule types ship, composable and order dependent, each receiving what the previous one
produced. Rules derive from an exported base marked `EditInlineNew`, so adding a rule type
means subclassing it and overriding `Apply` — nothing in the UI changes, and a studio can keep
its own rules in its own module.

### Honest reporting was a design problem, not a formatting one

![The Namestead project health report, showing five categories and the buttons that turn findings back into a rename batch.](../../assets/projects/namestead/project-health.png)

*Five categories in one pass. The buttons turn what it found back into an ordinary preview.*

- **A percentage appears only where there is something honest to divide by.** The organization
  check divides by the assets the folder plan has an opinion about, not the whole project —
  otherwise a plan covering one class scores a project 99% organised on the strength of saying
  almost nothing.
- **Not configured is never reported as clean.** A project with no convention set has declined
  the check, not passed it, so the report says so and exits non-zero.
- **Two categories are named for what they can actually prove.** "Potentially unreferenced" is
  not *unused*, and "duplicate import candidates" are not confirmed duplicates. Nothing in the
  plugin offers to delete anything.

### Undo, and why there is not one

A batch asset rename cannot be undone with Ctrl+Z, and the reason is structural. Undo replays
serialized property data — and an object's **name and outer are not property data**. Wrapping
the rename in a transaction does not help; Epic's own renamer wraps one anyway, which is worse
than offering nothing, because it looks like an undo and is not.

Namestead records every run to CSV instead, and any run can be loaded back in reverse as an
ordinary preview — same validation, same collision check, nothing moved until you press it. It
resolves against the project as it stands now, so anything renamed or deleted since is left
out and counted on screen. It works after the editor has been closed and reopened, which
Ctrl+Z cannot.

Reversals walk back to front: within a batch, a later rename may have freed the name an
earlier one wanted.

Renaming level actors genuinely does undo, because a label change goes through `Modify`. That
asymmetry is why actors are a separate mode, not a checkbox.

## Key engineering challenges

**The rename that destroys the asset.** A rename changing only letter case does not fail
loudly. The engine renames the package in memory, reports success, then cannot write the new
file beside the old one on a case-insensitive filesystem — and nothing survives under either
name. I found this against a real asset, which did not come back.

Namestead refuses those, and the refusal is part of the interface rather than a silent skip:
the rows stay visible with their reason, the action button's count drops to match, and the
message says what to do instead.

![Three renames refused because they differ only in case, each row showing its reason.](../../assets/projects/namestead/panel-refusal.png)

*The rows stay visible with their reason, and the button drops to zero.*

Also refused: World Partition and One File Per Actor maps, whose external actors the engine
leaves behind; two assets in one batch heading for the same name; and engine or script content.

**Two verification passes that each catch what the other cannot.** One packages against every
installed engine with `-StrictIncludes`, which disables the precompiled header and the unity
build so every header has to compile on its own. The other builds a throwaway host project per
engine and runs the whole suite with `-DisableAdaptiveUnity`, forcing translation units
together.

Neither finds what the other does, and both have caught a real defect. The test pass found one
the build pass could not: three rule sets shipped as assets loaded on 5.8 and on nothing
older, because a package carries the version of the engine that saved it. They are built in
code now.

## Current status and limitations

Released and feature-complete for what v1.0 set out to do.

| Engine | On Fab | Tests |
| --- | --- | --- |
| 5.8 | Yes — developed against | 56 of 56 pass |
| 5.7 | Yes | 56 of 56 pass |
| 5.6 | Yes | 56 of 56 pass |
| 5.5 | No | 56 of 56 pass |
| 5.4 | No | 56 of 56 pass |

- **Win64 only.** There is no platform-specific code in it, so it would very likely build and
  run on a macOS or Linux editor. It is restricted because it has never been run on one.
- **No Ctrl+Z for an asset rename**, for the structural reason above. The recorded history and
  its reverse-run are the mitigation, and they are presented as a preview rather than an undo.
- **Renaming an asset placed in a level leaves a redirector**, unconditionally. The engine
  refuses to load map packages for reference fix-up, so it is reported rather than hidden.
