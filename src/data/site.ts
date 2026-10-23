/*
 * ---------------------------------------------------------------------------
 *  Personal details and switches
 * ---------------------------------------------------------------------------
 *  Everything a recruiter sees about *me* rather than about a project lives
 *  here. Nothing in this file is invented: anything I could not verify is
 *  `null`, and the components treat `null` as "do not render" rather than
 *  printing an empty row or a dead link.
 *
 *  Fields marked TODO are the ones to fill in. See CHECKLIST.md.
 */

export interface ExperienceEntry {
  role: string;
  /** Employer name. Leave null to describe the work without naming them. */
  employer: string | null;
  /** e.g. "Mar 2024 - present". Leave null to omit the dates line. */
  period: string | null;
  location: string | null;
  /** Each bullet must be something you can defend in an interview. */
  points: string[];
}

export interface EducationEntry {
  qualification: string;
  institution: string | null;
  period: string | null;
}

export const site = {
  /* ---- identity ---------------------------------------------------------- */
  name: 'Low Sze Hao',
  role: 'Unreal Engine C++ Developer',
  specialisms: ['XR Simulation', 'Framework Engineering', 'Developer Tools'],
  tagline: 'Building reusable XR systems, interactive simulations, and developer tools.',

  intro:
    'I develop Unreal Engine applications and reusable systems, with professional ' +
    'experience in VR training and personal projects focused on XR frameworks and ' +
    'editor tooling.',

  /** The understated availability line. Deliberately not the headline. */
  location: 'Malaysia',
  availability: 'Based in Malaysia, open to relevant international opportunities including Australia and New Zealand.',

  /** Roughly how long I have been doing this professionally, in my own words. */
  experienceSummary: 'Three years of professional experience',

  /* ---- contact ----------------------------------------------------------- */
  /*
   * Change it here and it changes everywhere on the site. Note this is not the
   * same address as the Namestead support contact (lowszehao.dev@gmail.com),
   * which stays as the product's support channel.
   */
  email: 'szehao10@gmail.com',

  github: 'https://github.com/LOWSZEHAO',

  linkedin: 'https://www.linkedin.com/in/szehao-low-9609b527a/' as string | null,

  /*
   * Deliberately not on the site: the phone number from the CV. A number on a
   * public page gets scraped. It is on the PDF, which is where it belongs.
   */

  /*
   * TODO: add a real CV.
   *   1. Put the PDF at public/cv/Low-Sze-Hao-CV.pdf
   *   2. Set this to '/cv/Low-Sze-Hao-CV.pdf'
   * While it is null the "Download CV" button is hidden, so the site never
   * offers a download that does not exist.
   */
  cv: null as string | null,

  /* ---- metadata ---------------------------------------------------------- */
  metaDescription:
    'Low Sze Hao - Unreal Engine C++ developer working on XR interaction ' +
    'frameworks, industrial VR training simulation, and Unreal editor tooling. ' +
    'Based in Malaysia.',

  /** Shown in the footer so a reader knows how current the site is. */
  lastUpdated: '2026-10',
} as const;

/*
 * Professional history. Kept deliberately close to the wording on the CV, so a
 * recruiter reading both does not find two different accounts of the same job.
 * Nothing here names a client - see CHECKLIST.md on why.
 */
export const experience: ExperienceEntry[] = [
  {
    role: 'VR Developer (R&D)',
    employer: 'VirtualX',
    period: 'March 2024 – Present',
    location: 'Malaysia',
    points: [
      'Build Unreal Engine 5 VR training simulations that turn industrial Standard Operating Procedures into interactive, realistic training.',
      'Engineer and maintain reusable C++ XR framework components and VR interaction systems, so simulation work scales across projects rather than restarting each time.',
      'Implement simulation logic, training workflows and interactive scenarios against the operational procedures they are meant to teach.',
      'Carry out technical R&D and troubleshoot OpenXR applications across Windows PC VR and Android standalone headsets.',
      'Contribute to HTTP/API integration, session management and application data-tracking for VR training systems.',
    ],
  },
];

export const education: EducationEntry[] = [
  {
    qualification: 'Bachelor of Multimedia (Hons.) Virtual Reality — CGPA 3.54',
    institution: 'Multimedia University (MMU), Cyberjaya',
    period: null, // optional: add the years if you want them shown
  },
  {
    qualification: 'Diploma in Interactive Multimedia with Animation Design',
    institution: 'INTI College Subang',
    period: null,
  },
];

/** Spoken languages. Worth stating for international applications. */
export const languages = ['Mandarin', 'English', 'Malay'] as const;

export const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/#contact' },
] as const;
