import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// Removed unused import MapPin

const HeroSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const nameLetters = "JOE".split('');

  return (
    <section 
      id="home" 
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-chart-1/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Enhanced desktop design */}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >

          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-full shadow-sm border border-chart-1/20"
            >
              <div className="w-3 h-3 bg-chart-1 rounded-full animate-pulse"></div>
              <span className="text-sm text-foreground font-medium">{'{ Building Digital Solutions }'}</span>
            </motion.div>

            {/* Animated Joe text with typewriter effect */}
            <div className="flex justify-center items-center flex-wrap gap-1 sm:gap-2">
              {nameLetters.map((letter, index) => (
                <motion.h1
                  key={index}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight hover:text-chart-1 transition-colors duration-200"
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={inView ? { 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                  } : { opacity: 0, y: 50, rotateX: -90 }}
                  transition={{ 
                    delay: 0.3 + index * 0.05, 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  style={{
                    cursor: "default"
                  }}
                >
                  {letter}
                </motion.h1>
              ))}
            </div>
            
            <div className="space-y-2">
              <p className="text-xl md:text-2xl text-chart-1 font-medium">
                Software Engineer
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-chart-2">const</span>
                  <span className="text-foreground">expertise</span>
                  <span className="text-chart-2">=</span>
                </div>
                <div className="text-green-500 text-center">
                  <span className="sm:hidden">["React", "Next.js", "Node.js",</span>
                  <span className="sm:hidden">"Express.js", "PHP", "NestJS"]</span>
                  <span className="hidden sm:inline">["React", "Next.js", "Node.js", "Express.js", "PHP", "NestJS"]</span>
                </div>
              </div>
            </div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-lg"
          >
            Crafting robust web applications and modernizing legacy systems at{' '}
            <span className="text-chart-1 font-medium">Al Baraka Fertility Hospital</span>. 
            From React frontends to Node.js backends, I transform complex healthcare requirements into elegant digital solutions.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <span className="font-mono text-chart-2">{'{ '}</span>
            <span>Building the future, one line at a time</span>
            <span className="font-mono text-chart-2">{' }'}</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 px-4 sm:px-0"
          >
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium neon-glow text-sm sm:text-base flex items-center gap-2"
            >
              <span>{'<'}</span>
              Let's Code Together
              <span>{'/>'}</span>
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 sm:px-8 sm:py-4 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-300 font-medium text-sm sm:text-base flex items-center gap-2 font-mono"
            >
              <span className="text-chart-2">git</span>
              <span>checkout</span>
              <span className="text-green-500">--about-me</span>
            </button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;