import React from 'react';
import portrait from '../assets/ppp.jpg';

const HomePage: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-portrait">
        <img src={portrait} alt="Prajwal portrait" />
      </div>

      <div className="hero-copy">
        <p className="hero-eyebrow">
          Hi, I’m Prajwal <span className="hero-wave">👋</span>
        </p>
        <h1 className="hero-title">
          I write code that’s fast, secure, and only panics when absolutely
          necessary. Unlike me.
        </h1>
        <p className="hero-subtitle">
          I’m into systems programming, blockchains, and anything that lets me
          peek under the hood and say “ohhh, that’s how it works.”
        </p>

        <div className="hero-actions">
          <a href="/portfolio" className="btn primary">
            View Portfolio
          </a>
          <a href="/contact" className="btn secondary">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
