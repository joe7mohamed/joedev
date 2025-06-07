import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code2, Heart, Lightbulb, Users } from 'lucide-react';
import { portfolioData } from '../data/portfolio';

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { about } = portfolioData;

  const valueIcons = [Code2, Users, Lightbulb];

  return (
    <section id="about" ref={ref} className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="space-y-12 sm:space-y-16 md:space-y-20"
        >
          {/* Minimalist Header */}
          <div className="text-center space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground tracking-tight">
                The Story Behind
                <span className="block text-chart-1 font-medium">The Code</span>
              </h2>
            </motion.div>
          </div>

          {/* Philosophy Cards */}
          <div className="grid gap-8 sm:gap-12 md:gap-16">
            {/* Intro Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed italic">
                "{about.intro}"
              </blockquote>
              <div className="mt-6 sm:mt-8 flex justify-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-chart-1 to-chart-2"></div>
              </div>
            </motion.div>

            {/* Philosophy & Passion */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-chart-1" />
                  <h3 className="text-xl font-medium text-foreground">Philosophy</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-9">
                  {about.philosophy}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Code2 className="w-6 h-6 text-chart-2" />
                  <h3 className="text-xl font-medium text-foreground">Passion</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-9">
                  {about.passion}
                </p>
              </motion.div>
            </div>

            {/* Core Values */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-light text-foreground">Core Values</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {about.coreValues.map((value, index) => {
                  const Icon = valueIcons[index];
                  return (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 1.1 + index * 0.2, duration: 0.6 }}
                      className="group bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-chart-1/30 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-chart-1/20 to-chart-2/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-chart-1" />
                        </div>
                        <h4 className="font-medium text-foreground">{value.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;