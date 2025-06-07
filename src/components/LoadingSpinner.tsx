import React from 'react';
import { motion } from 'framer-motion';
import DevLoadingSpinner from './DevLoadingSpinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  showBranding?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'lg', 
  message = 'Initializing...',
  fullScreen = true,
  showBranding = true
}) => {
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background"
      >
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <DevLoadingSpinner size={size} message={message} showName={showBranding} />
          </motion.div>

          {showBranding && (
            <>
              <motion.h1
                className="text-4xl md:text-5xl font-light text-foreground tracking-wide"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Youssef Zaky
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-2"
              >
                <p className="text-muted-foreground text-lg font-light">
                  Software Engineer
                </p>
                <div className="font-mono text-chart-1 text-sm">
                  <span>{'const'}</span>
                  <span className="text-muted-foreground">{' loading = '}</span>
                  <span className="text-green-500">true</span>
                  <motion.span
                    animate={{ opacity: [0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    ;
                  </motion.span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] py-12">
      <DevLoadingSpinner size={size} message={message} showName={false} />
    </div>
  );
};

export default LoadingSpinner;