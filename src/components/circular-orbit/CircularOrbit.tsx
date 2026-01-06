import React from 'react';
import { CircularOrbitProps } from './types';
import './CircularOrbit.css';

const CircularOrbit: React.FC<CircularOrbitProps> = ({
  creatorSkills,
  builderSkills,
}) => {
  return (
    <section
      className="skills-section"
      role="region"
      aria-label="Technical skills showcase"
    >
      {/* Creator Section */}
      <div className="logo-row">
        <h2 className="row-heading row-heading-creator">creator</h2>

        <div className="logo-track track-left-to-right">
          <div className="logo-set-wrapper">
            {/* First set */}
            <div className="logo-set">
              {creatorSkills.map((logo, index) => (
                <div
                  key={`creator-1-${logo.name}-${index}`}
                  className="orbit-logo"
                >
                  <img
                    src={logo.icon}
                    alt={logo.name}
                    title={logo.name}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="logo-set">
              {creatorSkills.map((logo, index) => (
                <div
                  key={`creator-2-${logo.name}-${index}`}
                  className="orbit-logo"
                >
                  <img
                    src={logo.icon}
                    alt={logo.name}
                    title={logo.name}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Builder Section */}
      <div className="logo-row">
        <h2 className="row-heading row-heading-builder">builder</h2>

        <div className="logo-track track-right-to-left">
          <div className="logo-set-wrapper">
            {/* First set */}
            <div className="logo-set">
              {builderSkills.map((logo, index) => (
                <div
                  key={`builder-1-${logo.name}-${index}`}
                  className="orbit-logo"
                >
                  <img
                    src={logo.icon}
                    alt={logo.name}
                    title={logo.name}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="logo-set">
              {builderSkills.map((logo, index) => (
                <div
                  key={`builder-2-${logo.name}-${index}`}
                  className="orbit-logo"
                >
                  <img
                    src={logo.icon}
                    alt={logo.name}
                    title={logo.name}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CircularOrbit;
