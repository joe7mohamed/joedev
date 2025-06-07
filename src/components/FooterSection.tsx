import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Linkedin, Github, ExternalLink, Heart, Code } from 'lucide-react';

const FooterSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Email',
      href: 'mailto:youssef.m.ibrahim.zaky@gmail.com',
      icon: Mail,
      color: 'hover:text-red-400'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/youssef7mohamed',
      icon: Linkedin,
      color: 'hover:text-blue-400'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/youssef7mohamed',
      icon: Github,
      color: 'hover:text-purple-400'
    }
  ];

  return (
    <footer ref={ref} className="relative py-20 px-6 bg-gradient-to-br from-card via-muted to-card text-foreground overflow-hidden border-t border-border">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-chart-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12"
        >
          {/* Main CTA Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center gap-3"
            >
              <Code className="w-6 h-6 text-chart-1" />
              <span className="font-mono text-chart-1 font-medium">{'{ ready_to_code: true }'}</span>
              <Code className="w-6 h-6 text-chart-1" />
            </motion.div>
            
            <h3 className="text-3xl md:text-4xl font-light">
              Let's Ship Something 
              <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">Epic</span>
            </h3>
            
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Got an idea? Let's turn it into reality with clean code and modern tech.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium neon-glow flex items-center justify-center gap-2"
            >
              <span>{'const project = startProject()'}</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-border text-foreground rounded-lg hover:bg-muted transition-all duration-300 font-medium flex items-center justify-center gap-2"
            >
              <Code className="w-4 h-4" />
              <span>{'git log --portfolio'}</span>
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-center gap-6"
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className={`p-3 bg-card rounded-full border border-border text-muted-foreground ${link.color} transition-all duration-300 hover:border-current hover:bg-muted`}
                aria-label={link.name}
              >
                <link.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>
          
          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-8 border-t border-border"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                © {currentYear} Youssef Zaky. Made with 
                <Heart className="w-4 h-4 text-red-500 animate-pulse" /> 
                in Bahrain 🇧🇭
              </p>
              
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span>Network & Programming Officer</span>
                <span>•</span>
                <span>Healthcare Tech Specialist</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;