import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ExternalLink, Sparkles, Code2, ChevronRight, Building2, ShoppingBag, Home } from 'lucide-react';
import { portfolioData } from '../data/portfolio';

interface Project {
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: string;
  status: string;
  url: string;
  demoUrl: string;
  features: string[];
  businessImpact: string[];
  futureEnhancements: string[];
}

const PortfolioSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const projects: Project[] = portfolioData.projects;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'healthcare technology':
        return Building2;
      case 'luxury b2b marketplace':
        return ShoppingBag;
      case 'property management':
        return Home;
      default:
        return Code2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live production':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'in development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const categories = [
    { id: 'all', name: 'All Projects', icon: Sparkles },
    { id: 'Healthcare Technology', name: 'Healthcare', icon: Building2 },
    { id: 'Luxury B2B Marketplace', name: 'Marketplace', icon: ShoppingBag },
    { id: 'Property Management', name: 'Property', icon: Home },
    { id: 'Portfolio & Personal Brand', name: 'Portfolio', icon: Code2 }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section id="portfolio" ref={ref} className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1/10 text-chart-1 rounded-full font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Featured Projects</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-light text-foreground">
              Projects Showcase
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              Transforming ideas into powerful digital solutions. Each project represents a unique challenge 
              solved with cutting-edge technology and innovative thinking.
            </p>
          </div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-chart-1 text-white shadow-lg neon-glow'
                    : 'bg-card border border-border hover:border-chart-1/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => {
              const CategoryIcon = getCategoryIcon(project.category);
              return (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-chart-1/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute top-3 right-3 z-10 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                  
                  {/* Project Image/Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-chart-1/10 to-chart-2/10 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-16 h-16 text-chart-1/30" />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium neon-glow flex items-center gap-2"
                        aria-label="View project"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>View Live Site</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-chart-1 transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span 
                          key={tech}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 text-muted-foreground text-xs">
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Live Site Link */}
                    <div className="pt-2">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-chart-1 hover:text-chart-2 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {project.url.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>

                    {/* Key Features */}
                    <div className="pt-2">
                      <h4 className="text-sm font-medium text-foreground mb-2">Key Features:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {project.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="w-1 h-1 bg-chart-1 rounded-full mt-1.5 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center space-y-6 pt-8"
          >            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each project showcases expertise in modern web development, database architecture, 
              and business solution design. Ready to bring your vision to life?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium neon-glow flex items-center justify-center gap-2"
              >
                <span>Start Your Project</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-300 font-medium flex items-center justify-center gap-2"
              >
                <Code2 className="w-5 h-5" />
                <span>View Services</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;