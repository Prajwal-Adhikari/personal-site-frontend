export type ProjectStatus = 'planned' | 'in-progress' | 'completed';
export type Project = {
  id: number;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
};

export const projects: Project[] = [
  {
    id: 1,
    title: 'Personal Website',
    description:
      'This site you’re looking at – built with React on the frontend and Rust + Axum on the backend, with a Postgres database.',
    techStack: ['React', 'TypeScript', 'Vite', 'Rust', 'Axum', 'Postgres'],
    githubUrl: 'https://github.com/yourusername/personal-site',
    liveUrl: 'https://prajwal.dev',
    status: 'in-progress',
  },
  {
    id: 2,
    title: 'Rust Chat Server',
    description:
      'A simple chat server and client written in Rust to learn async networking, protocols, and modular design.',
    techStack: ['Rust', 'Tokio'],
    githubUrl: 'https://github.com/yourusername/rust-chat-server',
    status: 'planned',
  },
  {
    id: 3,
    title: 'Twine Tools / Experiments',
    description:
      'Small internal tools and experiments to automate workflows, analyze data, or integrate with Twine systems.',
    techStack: ['TypeScript', 'Node.js'],
    status: 'completed',
  },
  {
    id: 4,
    title: 'New Project',
    description: 'Cool stuff',
    techStack: ['Rust', 'React'],
    status: 'in-progress',
  },
];
