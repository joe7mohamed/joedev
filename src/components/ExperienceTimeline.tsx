import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Briefcase, GraduationCap, Heart, MapPin } from 'lucide-react';
import { portfolioData } from '../data/portfolio';

const ExperienceTimeline: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { experience, education, volunteer } = portfolioData;

  return (
    <section id="experience" ref={ref} className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="space-y-16 sm:space-y-20"
        >
          {/* Header */}
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
              Professional Journey
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
              Building impactful software solutions
            </p>
          </div>

          {/* Work Experience Section */}
          <div className="space-y-8 sm:space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-chart-1" />
                </div>
                <h3 className="text-2xl font-medium text-foreground">Work Experience</h3>
              </div>

              <div className="space-y-6">
                {/* Current Role */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative pl-6 sm:pl-8 border-l-2 border-chart-1"
                >
                  <div className="absolute -left-2.5 w-5 h-5 bg-chart-1 rounded-full border-4 border-background"></div>
                  <div className="bg-gradient-to-r from-chart-1/5 to-chart-2/5 p-6 rounded-xl border border-chart-1/20 hover:shadow-lg transition-all duration-300">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-xl font-semibold text-foreground">
                            {experience.current.title}
                          </h4>
                          <div className="flex items-center gap-2 text-chart-1 font-medium">
                            <span>{experience.current.company}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{experience.current.location}</span>
                          </div>
                        </div>
                        <span className="text-sm font-medium bg-chart-1 text-white px-3 py-1 rounded-full">
                          {experience.current.period}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-w-3xl">
                        {experience.current.responsibilities.map((responsibility, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-chart-1 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{responsibility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Previous Experience */}
                {experience.previous.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="relative pl-6 sm:pl-8 border-l-2 border-border/50"
                  >
                    <div className="absolute -left-2.5 w-5 h-5 bg-muted border-4 border-background rounded-full"></div>
                    <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-all duration-300">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="text-lg font-semibold text-foreground">
                              {exp.title}
                            </h4>
                            <div className="text-muted-foreground font-medium">
                              {exp.company}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{exp.location}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full">
                            {exp.period}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Education Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-medium text-foreground">Education</h3>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 p-6 rounded-xl border border-blue-500/20"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-2">
                      <h4 className="text-xl font-semibold text-foreground">
                        {education.degree}
                      </h4>
                      <div className="text-blue-500 font-medium">
                        {education.university}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{education.location}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium bg-blue-500 text-white px-3 py-1 rounded-full">
                      {education.period}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    {education.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Volunteer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-medium text-foreground">Community Service</h3>
              </div>

              {volunteer.map((vol, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-r from-red-500/5 to-pink-500/5 p-6 rounded-xl border border-red-500/20"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-foreground">
                          {vol.title}
                        </h4>
                        <div className="text-red-500 font-medium">
                          {vol.organization}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{vol.location}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium bg-red-500 text-white px-3 py-1 rounded-full">
                        {vol.period}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                      {vol.description}
                    </p>

                    <div className="space-y-2 max-w-3xl">
                      {vol.responsibilities.map((responsibility, respIndex) => (
                        <div key={respIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{responsibility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExperienceTimeline;