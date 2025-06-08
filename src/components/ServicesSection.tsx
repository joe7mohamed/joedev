import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Search, 
  Lightbulb, 
  Code2, 
  Rocket, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const ServicesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const processSteps = [
    {
      step: "01",
      title: "Discovery",
      description: "Understanding your vision and requirements",
      icon: Search,
      details: ["Requirements analysis", "Technical feasibility", "Project scoping"]
    },
    {
      step: "02", 
      title: "Strategy",
      description: "Planning the perfect solution for your needs",
      icon: Lightbulb,
      details: ["Technology selection", "Architecture design", "Timeline planning"]
    },
    {
      step: "03",
      title: "Development",
      description: "Building your application with modern tools",
      icon: Code2,
      details: ["Agile development", "Clean code practices", "Regular updates"]
    },
    {
      step: "04",
      title: "Launch",
      description: "Deploying and optimizing for success",
      icon: Rocket,
      details: ["Production deployment", "Performance optimization", "Ongoing support"]
    }
  ];

  return (
    <section id="services" ref={ref} className="py-12 md:py-20 px-4 bg-surface">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="space-y-16"
        >
          {/* Header */}
          <div className="text-center md:text-center text-left space-y-4">
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="px-4 py-2">
                Process
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              What I Can Build For You
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl md:mx-auto"
            >
              Simple, streamlined process from idea to launch
            </motion.p>
          </div>

          {/* Process Steps */}
          <div className="relative max-w-4xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border transform -translate-x-1/2 hidden md:block" />
            
            <div className="space-y-8 md:space-y-16">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Step Content */}
                  <div className="flex-1 text-left order-2 md:order-none">
                    <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <step.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Step Number */}
                  <div className="relative z-10 flex-shrink-0 order-1 md:order-none">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-chart-1 text-white rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow-lg border-2 border-chart-1/20 relative overflow-hidden">
                      {/* Gradient background for better theming */}
                      <div className="absolute inset-0 bg-gradient-to-br from-chart-1 to-chart-2 opacity-90" />
                      <span className="relative z-10 font-bold">{step.step}</span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 neon-glow"
              onClick={() => {
                const element = document.getElementById('contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;