/*
 * ---------------------------------------------------------------------------
 *  Technical skills
 * ---------------------------------------------------------------------------
 *  Deliberately short. This section exists so a recruiter can tell in a few
 *  seconds what I work on; the depth belongs in the case studies, where an
 *  interviewer can see the architecture, the decisions and the tests.
 *
 *  One rule: every label is backed by a project on this site. If you add one
 *  and cannot name the project that demonstrates it, it does not belong here.
 *  No proficiency scores, no self-assigned levels.
 *
 *  Current backing:
 *    Programming         — FlexXR, Namestead, VR training
 *    XR & Simulation     — FlexXR (PCVR + Quest 3 standalone), VR training
 *    Engine Engineering  — FlexXR (runtime plugin), Namestead (editor plugin)
 */

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming',
    items: ['C++', 'Unreal Engine Blueprints'],
  },
  {
    title: 'XR & Simulation',
    items: [
      'Unreal Engine 5',
      'OpenXR',
      'Meta Quest / PCVR',
      'XR Interaction Systems',
      'VR Training Simulation',
    ],
  },
  {
    title: 'Engine Engineering',
    items: [
      'Runtime & Editor Plugins',
      'C++ System Architecture',
      'HTTP / REST API Integration',
      'Automated Testing & CI',
      'Quest Packaging & Testing',
    ],
  },
];
