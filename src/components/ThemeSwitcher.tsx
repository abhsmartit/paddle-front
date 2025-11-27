import { useEffect, useState } from 'react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <button
      type="button"
      className="icon-button theme-switcher"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeSwitcher;
