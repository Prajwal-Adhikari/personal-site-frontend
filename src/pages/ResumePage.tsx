import React from 'react';
import { resumeSections, resumeContent } from '../data/resume';
import type { ResumeSectionId } from '../data/resume';
import ResumeOrb from '../components/resume/ResumeOrb';

const ResumePage: React.FC = () => {
  const [showAllDetails, setShowAllDetails] = React.useState(false);
  const [activeSection, setActiveSection] =
    React.useState<ResumeSectionId>('overview');

  const activeData = resumeContent[activeSection];
  const maxLinesWhenCollapsed = 2;
  const visibleLines = showAllDetails
    ? activeData.body
    : activeData.body.slice(0, maxLinesWhenCollapsed);
  const activeSectionConfig = resumeSections.find(
    (s) => s.id === activeSection
  )!;

  return (
    <section className="section resume-layout">
      <div className="resume-left">
        <h2>Resume</h2>
        <p className="resume-subtitle">
          A quick overview of my background. You can switch sections — the 3D
          piece on the right reacts to your selection.
        </p>

        <div className="resume-tabs">
          {resumeSections.map((section) => (
            <button
              key={section.id}
              className={`resume-tab ${
                section.id === activeSection ? 'resume-tab-active' : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="resume-content">
          <h3>{activeData.title}</h3>
          <ul>
            {visibleLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
          {activeData.body.length > maxLinesWhenCollapsed && (
            <button
              className="resume-toggle-details"
              onClick={() => setShowAllDetails((prev) => !prev)}
            >
              {showAllDetails ? 'Show les' : 'Show more details'}
            </button>
          )}
        </div>
      </div>

      <div className="resume-right">
        <ResumeOrb color={activeSectionConfig.highlightColor} />
        <p className="resume-orb-caption">
          Active section: <span>{activeSectionConfig.label}</span>
        </p>
      </div>
    </section>
  );
};

export default ResumePage;
