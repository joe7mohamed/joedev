import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  SiReact, 
  SiNodedotjs, 
  SiTailwindcss,
  SiExpress,
  SiNestjs,
  SiSharp,
  SiPhp,
  SiGit,
  SiAmazon,
  SiFlutter,
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiPython,
  SiOracle,
  SiNextdotjs,
  SiTypescript,
  SiMongodb,
  SiMysql
} from 'react-icons/si';
import { Cloud, Users, Brain, Clock, Target } from 'lucide-react';
import { portfolioData } from '../data/portfolio';

const SkillsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const iconMap: Record<string, React.ComponentType> = {
    'C#': SiSharp,
    'Java': SiOracle,
    'HTML': SiHtml5,
    'CSS': SiCss3,
    'PHP': SiPhp,
    'JavaScript': SiJavascript,
    'Python': SiPython,
    'Dart': SiFlutter,
    'React.js': SiReact,
    'Next.js': SiNextdotjs,
    'Flutter': SiFlutter,
    'Express.js': SiExpress,
    'Git': SiGit,
    'TailwindCSS': SiTailwindcss,
    'ShadCN': SiReact,
    'Redux': SiReact,
    'Framer Motion': SiReact,
    'TypeScript': SiTypescript,
    'MongoDB': SiMongodb,
    'MySQL': SiMysql,
    'AWS': SiAmazon,
    'Node.js': SiNodedotjs,
    'NestJS': SiNestjs,
  };

  const colorMap: Record<string, string> = {
    'C#': '#239120',
    'Java': '#ED8B00',
    'HTML': '#E34F26',
    'CSS': '#1572B6',
    'PHP': '#777BB4',
    'JavaScript': '#F7DF1E',
    'Python': '#3776AB',
    'Dart': '#0175C2',
    'React.js': '#61DAFB',
    'Next.js': '#000000',
    'Flutter': '#02569B',
    'Express.js': '#000000',
    'Git': '#F05032',
    'TailwindCSS': '#06B6D4',
    'ShadCN': '#000000',
    'Redux': '#764ABC',
    'Framer Motion': '#FF0055',
    'TypeScript': '#3178C6',
    'MongoDB': '#47A248',
    'MySQL': '#4479A1',
    'AWS': '#FF9900',
    'Node.js': '#339933',
    'NestJS': '#E0234E',
  };

  const skillCategories = [
    {
      category: 'Programming Languages',
      skills: portfolioData.skills.programming.map(skill => ({
        name: skill.name,
        icon: iconMap[skill.name] || SiReact,
        color: colorMap[skill.name] || '#6366f1'
      }))
    },
    {
      category: 'Technologies & Frameworks',
      skills: portfolioData.skills.technologies.map(skill => ({
        name: skill.name,
        icon: iconMap[skill.name] || SiReact,
        color: colorMap[skill.name] || '#6366f1'
      }))
    },
    {
      category: 'Cloud & Infrastructure',
      skills: portfolioData.skills.cloud.map(skill => ({
        name: skill.name,
        icon: iconMap[skill.name] || Cloud,
        color: colorMap[skill.name] || '#6366f1'
      }))
    },
    {
      category: 'Personal Skills',
      skills: [
        { name: 'Communication', icon: Users, color: '#10b981' },
        { name: 'Teamwork', icon: Users, color: '#3b82f6' },
        { name: 'Time Management', icon: Clock, color: '#f59e0b' },
        { name: 'Problem Solving', icon: Brain, color: '#8b5cf6' },
        { name: 'Leadership', icon: Target, color: '#ef4444' },
        { name: 'Continuous Learning', icon: Brain, color: '#06b6d4' },
      ]
    }
  ];

  return (
    <section id="skills" ref={ref} className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 sm:space-y-12 md:space-y-16"
        >
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-foreground">
              Skills & Technologies
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto px-4">
              Comprehensive technical expertise spanning programming languages, modern frameworks, cloud platforms, and essential soft skills for delivering exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2 + categoryIndex * 0.1, duration: 0.6 }}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-border/50 hover:border-border transition-all duration-300"
              >
                <h3 className="text-base sm:text-lg font-medium text-foreground border-b border-border pb-3 mb-4 sm:mb-6">
                  {category.category}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ 
                        delay: 0.4 + categoryIndex * 0.1 + skillIndex * 0.05, 
                        duration: 0.4 
                      }}
                      whileHover={{ x: 6, scale: 1.02, transition: { duration: 0.2 } }}
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-default group"
                    >
                      <skill.icon 
                        className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 flex-shrink-0" 
                        style={{ color: skill.color }}
                      />
                      <span className="text-sm sm:text-base text-foreground font-medium group-hover:text-primary transition-colors truncate">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SkillsSection;