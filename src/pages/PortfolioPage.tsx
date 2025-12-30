import React from 'react';
import { projects } from '../data/projects';
import ProjectCard from '../components/projects/ProjectCard';

const PortfolioPage: React.FC = () => {
  return (
    <section className="section">
      <h2>Portfolio</h2>
      <p>
        Here are some projects I’ve worked on. I’ll keep updating this list as I
        build more things.
      </p>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            status={project.status}
            highlight={project.id === 1}
          />
        ))}
      </div>
    </section>
  );
};

export default PortfolioPage;
