/*
 * ---------------------------------------------------------------------------
 *  Technical skills
 * ---------------------------------------------------------------------------
 *  One rule for this file: every entry is backed by something in a repository,
 *  a shipped build, or a documented test run. No proficiency percentages, no
 *  "Expert" labels, and nothing listed because it appears on a roadmap.
 *
 *  `evidence` is the line that tells an interviewer where to look. If you add
 *  a skill and cannot write that line, the skill does not belong here.
 */

export interface SkillGroup {
  title: string;
  evidence: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    evidence: 'Both plugin projects are C++ end to end.',
    items: ['Unreal C++', 'Blueprint, as a binding surface over C++ rather than for logic'],
  },
  {
    title: 'XR and simulation',
    evidence: 'FlexXR runs on PCVR and Quest 3 standalone, confirmed in-headset on both.',
    items: [
      'Unreal Engine 5.6 – 5.8',
      'OpenXR',
      'Meta Quest 3 standalone (Android) packaging and on-device testing',
      'PCVR via Quest Link',
      'Hand tracking and motion controllers behind one interaction path',
      'Room-scale tracking and play-space origin handling',
      'Enhanced Input',
      'VR comfort and locomotion: teleport, smooth move, turn, vignette',
      'Mixed-reality groundwork: mode flags, spatial-anchor abstraction',
    ],
  },
  {
    title: 'Unreal Engine architecture and plugins',
    evidence: 'A six-module runtime plugin (FlexXR) and a commercial editor plugin (Namestead).',
    items: [
      'Multi-module plugin architecture',
      'One-way module dependencies, enforced in Build.cs',
      'UObject and component lifecycle, ownership, UPROPERTY discipline',
      'Engine, world and editor subsystems',
      'Slate editor UI',
      'Component visualizers and details customisations',
      'Commandlets for headless CI operations',
      'Engine Data Validation integration',
      'Asset Registry and IAssetTools',
      'Detail-panel API design: categories, EditCondition, clamped ranges',
    ],
  },
  {
    title: 'Systems and engineering practice',
    evidence:
      'Ten decision records in FlexXR. Namestead refuses operations that would destroy data, and says why.',
    items: [
      'Deterministic system design',
      'Solver and rule logic as plain C++, testable without a world',
      'Architecture decision records, including recorded reversals',
      'Extension surfaces, with what is closed documented',
      'Defensive design around destructive operations',
      'Allocation-free hot paths and stated frame budgets',
      'Public APIs and docs written for someone else to pick up',
    ],
  },
  {
    title: 'Application integration',
    evidence: 'From VR training work, where a run has to report what the trainee did.',
    items: [
      'HTTP and REST API integration from Unreal applications',
      'Session management across a training run',
      'Application data tracking and reporting',
    ],
  },
  {
    title: 'Testing and workflow',
    evidence:
      'Namestead: 56 test groups on five engine versions. FlexXR: automation tests in CI, plus a device build per phase.',
    items: [
      'Unreal Automation tests',
      'Determinism tests',
      'Multi-engine-version test matrices',
      'Unity-build and strict-include verification',
      'On-device smoke testing as a release gate',
      'Unreal Insights instrumentation',
      'Git and Git LFS',
      'GitHub Actions CI',
      'CSV reports and exit codes for build steps',
      'Android packaging and debugging: RunUAT BuildCookRun, adb, device logs',
    ],
  },
];
