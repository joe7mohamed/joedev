import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { submitContactForm, resetContactSubmissionStatus, type ContactFormData } from '../store/slices/appSlice';
import { Mail, MapPin, Send, Clock, Zap, Target, Gift, CheckCircle, AlertCircle } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const dispatch = useAppDispatch();
  const { contactSubmissionStatus, contactSubmissionMessage } = useAppSelector(state => state.app);
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: '',
    wantsFreeConsultation: false
  });

  useEffect(() => {
    if (contactSubmissionStatus === 'succeeded') {
      setFormData({
        name: '',
        email: '',
        company: '',
        projectType: '',
        message: '',
        wantsFreeConsultation: false
      });
      
      // Reset status after 5 seconds
      const timer = setTimeout(() => {
        dispatch(resetContactSubmissionStatus());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [contactSubmissionStatus, dispatch]);

  useEffect(() => {
    if (contactSubmissionStatus === 'failed') {
      // Reset error status after 5 seconds
      const timer = setTimeout(() => {
        dispatch(resetContactSubmissionStatus());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [contactSubmissionStatus, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(submitContactForm({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      projectType: formData.projectType,
      message: formData.message,
      wantsFreeConsultation: formData.wantsFreeConsultation
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }));
  };

  return (
    <section id="contact" ref={ref} className="py-24 px-6 bg-background relative">
      {/* Full Screen Loading Overlay */}
      {contactSubmissionStatus === 'loading' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 border-4 border-chart-1/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-chart-1 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-chart-2/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-chart-1/10 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Sending Your Message</h3>
              <p className="text-muted-foreground text-sm">Please wait while we deliver your inquiry...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Header with Free Consultation Offer */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-full font-medium neon-glow"
            >
              <Gift className="w-5 h-5" />
              <span>FREE 40-Minute Consultation</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-light text-foreground">
              Let's Build Your Next 
              <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent"> Digital Solution</span>
            </h2>
            
            <p className="text-muted-foreground text-xl max-w-4xl mx-auto leading-relaxed">
              From modern web applications to legacy system upgrades, I'll help you create robust, 
              scalable solutions that drive your business forward with cutting-edge technology.
            </p>
          </div>

          {/* Value Proposition Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Zap,
                title: "Modern Development",
                description: "Building with React, Node.js, and cutting-edge technologies",
                color: "from-blue-500 to-purple-600"
              },
              {
                icon: Target,
                title: "Scalable Solutions",
                description: "Architecture designed to grow with your business needs",
                color: "from-yellow-500 to-orange-600"
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Efficient development process with clear timelines",
                color: "from-green-500 to-teal-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info & Consultation Details */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 p-8 rounded-lg border border-chart-1/20">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-chart-1" />
                  <h3 className="text-2xl font-semibold text-foreground">What You'll Get in 40 Minutes</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Complete analysis of your project requirements",
                    "Technology stack recommendations",
                    "Development timeline and milestones",
                    "Architecture planning and best practices",
                    "Budget optimization strategies"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-chart-1 rounded-full mt-2 flex-shrink-0"></div>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-medium text-foreground">Ready to Get Started?</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-chart-1" />
                    <a 
                      href="mailto:youssef.m.ibrahim.zaky@gmail.com" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      youssef.m.ibrahim.zaky@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-chart-1" />
                    <span className="text-muted-foreground">Muharraq, Bahrain</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-card p-8 rounded-lg border border-border"
            >
              <h3 className="text-2xl font-semibold text-foreground mb-6">Book Your Free Consultation</h3>
              
              {/* Status Messages */}
              {contactSubmissionStatus === 'succeeded' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-chart-1/10 text-chart-1 rounded-lg mb-6 border border-chart-1/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{contactSubmissionMessage || 'Thank you! Your message has been sent successfully. I\'ll respond within 24 hours.'}</span>
                </motion.div>
              )}
              
              {contactSubmissionStatus === 'failed' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg mb-6 border border-destructive/20"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{contactSubmissionMessage || 'Sorry, there was an error sending your message. Please try again or email me directly.'}</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name*"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-chart-1 focus:border-transparent outline-none transition-colors bg-background text-foreground"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email*"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-chart-1 focus:border-transparent outline-none transition-colors bg-background text-foreground"
                  />
                </div>
                
                <input
                  type="text"
                  name="company"
                  placeholder="Company name (optional)"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-chart-1 focus:border-transparent outline-none transition-colors bg-background text-foreground"
                />
                
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-chart-1 focus:border-transparent outline-none transition-colors bg-background text-foreground"
                >
                  <option value="">Select project type*</option>
                  <option value="webapp">Web Application</option>
                  <option value="mobile">Mobile Application</option>
                  <option value="system">Legacy System Modernization</option>
                  <option value="integration">System Integration</option>
                  <option value="database">Database Architecture</option>
                  <option value="consulting">Technical Consulting</option>
                </select>
                
                <textarea
                  name="message"
                  placeholder="Tell me about your project and what you're looking to achieve*"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-chart-1 focus:border-transparent outline-none transition-colors resize-none bg-background text-foreground"
                />
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="wantsFreeConsultation"
                    checked={formData.wantsFreeConsultation}
                    onChange={handleCheckboxChange}
                    className="mt-1 text-chart-1 focus:ring-chart-1"
                  />
                  <label className="text-sm text-muted-foreground">
                    Yes, I want to claim my FREE 40-minute consultation to discuss my project
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={contactSubmissionStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-chart-1 to-chart-2 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactSubmissionStatus === 'loading' ? (
                    <>
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-5 h-5 border border-white/20 rounded-full animate-pulse"></div>
                      </div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {formData.wantsFreeConsultation ? 'Book My FREE Consultation' : 'Send Project Inquiry'}
                    </>
                  )}
                </button>
                
                <p className="text-xs text-muted-foreground text-center">
                  * Required fields. I'll respond within 24 hours with consultation scheduling options.
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;