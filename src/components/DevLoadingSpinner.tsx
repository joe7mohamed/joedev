import React from 'react';
import { motion } from 'framer-motion';

interface DevLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showName?: boolean;
}

const DevLoadingSpinner: React.FC<DevLoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  showName = true 
}) => {
  const sizeConfig = {
    sm: { container: 'w-12 h-12', text: 'text-xs', dots: 'w-1 h-1' },
    md: { container: 'w-16 h-16', text: 'text-sm', dots: 'w-1.5 h-1.5' },
    lg: { container: 'w-24 h-24', text: 'text-base', dots: 'w-2 h-2' },
    xl: { container: 'w-32 h-32', text: 'text-lg', dots: 'w-2.5 h-2.5' }
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main Spinner Container */}
      <div className={`relative ${config.container}`}>
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-chart-1 border-r-chart-2 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner rotating ring - opposite direction */}
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-b-chart-1 border-l-chart-2 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showName ? (
            <motion.span
              className="font-bold text-chart-1 tracking-wider font-mono"
              style={{ fontSize: size === 'sm' ? '0.6rem' : size === 'md' ? '0.8rem' : size === 'lg' ? '1rem' : '1.2rem' }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                scale: [0.95, 1, 0.95]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              JOE
            </motion.span>
          ) : (
            <motion.div
              className="font-mono text-chart-1 font-bold"
              style={{ fontSize: size === 'sm' ? '0.6rem' : size === 'md' ? '0.8rem' : size === 'lg' ? '1rem' : '1.2rem' }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {'{ }'}
            </motion.div>
          )}
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute ${config.dots} bg-chart-1 rounded-full`}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${size === 'sm' ? '24px' : size === 'md' ? '32px' : size === 'lg' ? '48px' : '64px'} 0px`,
            }}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear",
              delay: i * 0.33
            }}
          />
        ))}
      </div>

      {/* Loading text and progress */}
      {(message || size !== 'sm') && (
        <div className="text-center space-y-2">
          <motion.div
            className={`${config.text} text-muted-foreground font-medium`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.div>
          
          {size !== 'sm' && (
            <>
              {/* Terminal-like progress */}
              <motion.div
                className="font-mono text-chart-1 text-xs opacity-80"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span>{'$ npm run dev'}</span>
                <motion.span
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1"
                >
                  _
                </motion.span>
              </motion.div>

              {/* Progress dots */}
              <div className="flex justify-center space-x-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-chart-1 rounded-full"
                    animate={{ 
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      repeat: Infinity,
                      delay: i * 0.15
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DevLoadingSpinner;