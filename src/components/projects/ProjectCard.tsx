import React from 'react';
import type { Project, ProjectStatus } from '../../data/projects';

type ProjectCardProps = {
  project: Project;
  highlight?: boolean;
  status: ProjectStatus;
};
const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  highlight,
  status,
}) => {
  // we can use "status" inside now
  return (
    <article className={`project-card ${highlight ? 'highlight' : ''}`}>
      <div className="project-card-header">
        <h3 className="project-title">{project.title}</h3>

        <span className={`status-badge status-${status}`}>
          {status === 'planned' && 'Planned'}
          {status === 'in-progress' && 'In progress'}
          {status === 'completed' && 'Completed'}
        </span>
      </div>

      <p className="project-description">{project.description}</p>

      <ul className="project-tech">
        {project.techStack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>

      <div className="project-links">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            Live demo
          </a>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
