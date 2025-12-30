import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const baseNavItems = [
  { to: '/about', label: 'About' },
  { to: '/resume', label: 'Resume' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

const isAdminNavEnabled = () =>
  typeof window !== 'undefined' &&
  localStorage.getItem('showAdminNav') === 'true';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAdminNav, setShowAdminNav] = React.useState(isAdminNavEnabled);

  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        const next = !isAdminNavEnabled();
        localStorage.setItem('showAdminNav', String(next));
        setShowAdminNav(next);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const navItems = [
    ...baseNavItems,
    ...(showAdminNav ? [{ to: '/admin', label: 'Admin' }] : []),
  ];
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/" className="logo">
            Prajwal<span>.dev</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`nav-toggle ${isOpen ? 'nav-toggle-open' : ''}`}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
        </button>

        <ul className={`navbar-links ${isOpen ? 'navbar-links-open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                onClick={handleLinkClick}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
