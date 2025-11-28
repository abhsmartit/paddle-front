import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      aria-label="Toggle theme"
    >
      <span className="text-lg">
        {theme === 'light' ? '☀️' : '🌙'}
      </span>
    </Button>
  );
};

export default ThemeSwitcher;
