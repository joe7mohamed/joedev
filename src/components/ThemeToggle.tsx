import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ className = '', size = 'md' }) => {
  const { isDarkMode, toggleTheme, isTransitioning } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 w-3 h-3',
    md: 'p-2 w-5 h-5', 
    lg: 'p-3 w-6 h-6'
  };

  const iconSize = sizeClasses[size];

  return (
    <motion.button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`relative text-muted-foreground hover:text-foreground transition-all duration-200 rounded-lg hover:bg-muted overflow-hidden disabled:opacity-50 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={{ 
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <motion.div
        key={isDarkMode ? 'sun' : 'moon'}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
        transition={{ 
          duration: 0.2, 
          ease: [0.4, 0, 0.2, 1],
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className={iconSize.replace('p-', '').replace(' ', '')}
      >
        {isDarkMode ? (
          <Sun className={`${iconSize.split(' ').slice(1).join(' ')} text-yellow-500`} />
        ) : (
          <Moon className={`${iconSize.split(' ').slice(1).join(' ')} text-blue-600`} />
        )}
      </motion.div>
    </motion.button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;