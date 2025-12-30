export type ResumeSectionId =
  | 'overview'
  | 'experience'
  | 'education'
  | 'skills';

export type ResumeSection = {
  id: ResumeSectionId;
  label: string;
  highlightColor: string;
};

export const resumeSections: ResumeSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    highlightColor: '#38bdf8', // sky blue
  },
  {
    id: 'experience',
    label: 'Experience',
    highlightColor: '#22c55e', // green
  },
  {
    id: 'education',
    label: 'Education',
    highlightColor: '#eab308', // amber
  },
  {
    id: 'skills',
    label: 'Skills',
    highlightColor: '#a855f7', // purple
  },
];

export const resumeContent: Record<
  ResumeSectionId,
  { title: string; body: string[] }
> = {
  overview: {
    title: 'Overview',
    body: [
      'Software engineer interested in systems, backend, and Rust.',
      'I enjoy building end-to-end projects: from APIs and services to frontend UX.',
    ],
  },
  experience: {
    title: 'Experience',
    body: [
      'Software Engineer – Twine Labs · [Your dates here]',
      'Built internal tools and backend services, focusing on reliability and performance.',
      'Worked with TypeScript, Node, and Rust in production environments.',
    ],
  },
  education: {
    title: 'Education',
    body: [
      'BSc in Computer Science · [Your University]',
      'Focused on systems programming, computer architecture, and distributed systems.',
    ],
  },
  skills: {
    title: 'Skills',
    body: [
      'Languages: Rust, TypeScript, JavaScript',
      'Backend: Axum, Node.js, REST APIs',
      'Frontend: React, Vite, basic Three.js',
      'Other: Postgres, Docker, Git, Linux',
    ],
  },
};
