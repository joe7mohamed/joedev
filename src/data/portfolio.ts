export const portfolioData = {
  personal: {
    name: "Youssef Mohamed Ibrahim",
    nickname: "Youssef",
    title: "Full-Stack Software Engineer",
    email: "youssef.m.ibrahim.zaky@gmail.com",
    phone: "+973 3959 5097",
    location: "Muharraq, Bahrain",
    nationality: "Egyptian",
    avatar: "/avatar-placeholder.svg",
    tagline: "Full-Stack Engineer Crafting Digital Solutions for Healthcare, Luxury Markets & Property Management",
    specialization: "Specialized in modern web applications, business automation, and scalable system architecture with expertise in React.js, Node.js, and database optimization",
  },
  
  social: {
    github: "https://github.com/youssef7mohamed",
    linkedin: "https://linkedin.com/in/youssef7mohamed",
    instagram: "https://www.instagram.com/youssef7mohamed/",
    email: "youssef.m.ibrahim.zaky@gmail.com",
  },
  
  about: {
    intro: "Code is poetry in motion. I craft digital experiences that bridge the gap between complex technology and human needs.",
    philosophy: "Every line of code tells a story. Mine speaks of curiosity, dedication, and the endless pursuit of elegant solutions.",
    passion: "What drives me? The moment when scattered requirements transform into a working system that makes people's lives easier.",
    coreValues: [
      {
        title: "Clean Architecture",
        description: "Building systems that future developers will thank you for"
      },
      {
        title: "User-First Design", 
        description: "Technology should serve people, not the other way around"
      },
      {
        title: "Continuous Growth",
        description: "Every project teaches something new, every bug makes us stronger"
      }
    ]
  },
  
  skills: {
    programming: [
      { name: "C#", level: 88, category: "Language" },
      { name: "Java", level: 85, category: "Language" },
      { name: "HTML", level: 95, category: "Language" },
      { name: "CSS", level: 90, category: "Language" },
      { name: "PHP", level: 85, category: "Language" },
      { name: "JavaScript", level: 92, category: "Language" },
      { name: "Python", level: 80, category: "Language" },
      { name: "Dart", level: 78, category: "Language" },
    ],
    technologies: [
      { name: "React.js", level: 92, category: "Framework" },
      { name: "Next.js", level: 90, category: "Framework" },
      { name: "Flutter", level: 85, category: "Framework" },
      { name: "Express.js", level: 88, category: "Framework" },
      { name: "Git", level: 90, category: "Version Control" },
      { name: "TailwindCSS", level: 88, category: "Styling" },
      { name: "ShadCN", level: 85, category: "UI Library" },
      { name: "Redux", level: 82, category: "State Management" },
      { name: "Framer Motion", level: 80, category: "Animation" },
      { name: "TypeScript", level: 88, category: "Language" },
      { name: "MongoDB", level: 85, category: "Database" },
      { name: "MySQL", level: 87, category: "Database" },
    ],
    cloud: [
      { name: "PHP", level: 85, category: "Language" },
      { name: "AWS", level: 85, category: "Platform" },
      { name: "Node.js", level: 88, category: "Runtime" },
      { name: "NestJS", level: 85, category: "Framework" },
    ],
    personal: [
      { name: "Communication", level: 95, category: "Soft Skill" },
      { name: "Teamwork", level: 92, category: "Soft Skill" },
      { name: "Time Management", level: 90, category: "Soft Skill" },
      { name: "Problem Solving", level: 93, category: "Soft Skill" },
      { name: "Attention to Details", level: 88, category: "Soft Skill" },
      { name: "Leadership", level: 85, category: "Soft Skill" },
      { name: "Creativity", level: 87, category: "Soft Skill" },
      { name: "Continuous Learning", level: 95, category: "Soft Skill" },
    ],
  },
  
  experience: {
    current: {
      title: "Network & Programming Officer / Data Protection",
      company: "Al Baraka Fertility Hospital",
      location: "Adliya, Bahrain",
      period: "08/2024 – Present",
      responsibilities: [
        "Maintained and enhanced the hospital's legacy PHP-based information system across all departments (Reception, Medical, Billing, Quality)",
        "Led the initiative to modernize internal platforms using React.js, Node.js (NestJS), and MySQL for better scalability and staff experience",
        "Implemented secure data protection measures including daily encrypted backups and access-controlled environments",
        "Managed internal corporate email systems via GoDaddy, ensuring secure setup (SPF, DKIM) and seamless communication",
        "Provided technical support for network infrastructure, desktop systems, and medical device integrations",
        "Utilized modern frontend tools such as TailwindCSS, ShadCN, Redux, Framer Motion alongside backend and legacy tech (Bootstrap, jQuery, AJAX)",
      ],
    },
    previous: [
      {
        title: "IT Specialist",
        company: "CrediMax B.S.C",
        location: "Seef District, Bahrain",
        period: "03/2023 – 05/2023",
        description: "Supported smooth teamwork and efficient communication for better project coordination. Solved issues in applications and systems with analytical skills. Developed user-friendly mobile apps, tested for optimal performance with POS devices. Ensured attention to detail and quality standards throughout software development. Implemented security measures to protect data and ensure compliance.",
      },
    ],
  },

  education: {
    degree: "Bachelor of Software Engineering",
    university: "University of Bahrain",
    location: "Zalaq, Bahrain",
    period: "2018 – 2023",
    gpa: null,
    achievements: [],
    description: "Comprehensive software engineering program covering computer science fundamentals, software development methodologies, and practical application development."
  },

  volunteer: [
    {
      title: "Marshal",
      organization: "Bahrain International Circuit",
      location: "Zalaq, Bahrain", 
      period: "2019 – Present",
      description: "Volunteering to organize the motorsport races that are hosted at the Bahrain International Circuit every season (F1, Porsche, WEC, etc.)",
      responsibilities: [
        "Ensuring safety protocols during international racing events",
        "Coordinating with international teams and officials",
        "Managing track safety and emergency response procedures",
        "Contributing to successful execution of Formula 1, Porsche Carrera Cup, and WEC races"
      ]
    }
  ],
  
  
  services: [
    {
      title: "Full-Stack Web Development",
      description: "End-to-end web applications built with cutting-edge technologies for optimal performance and user experience.",
      icon: "Code",
      technologies: ["React", "Next.js", "Node.js", "TypeScript"]
    },
    {
      title: "API Development & Integration",
      description: "Robust RESTful APIs and seamless third-party integrations to connect your systems efficiently.",
      icon: "Globe",
      technologies: ["Express.js", "GraphQL", "REST", "Webhooks"]
    },
    {
      title: "Database Architecture",
      description: "Optimized database design and management for scalable, high-performance data solutions.",
      icon: "Database",
      technologies: ["MySQL", "MongoDB", "Redis", "PostgreSQL"]
    },
    {
      title: "Performance Optimization",
      description: "Speed up your applications with advanced optimization techniques and monitoring systems.",
      icon: "Zap",
      technologies: ["Caching", "CDN", "Bundle Optimization", "Monitoring"]
    }
  ],
  
  certifications: [
    {
      name: "Microsoft Certified: Azure Administrator Associate",
      issuer: "Microsoft", 
      icon: "Award",
    },
  ],

  languages: [
    {
      name: "Arabic",
      level: "Native",
      proficiency: 100,
    },
    {
      name: "English", 
      level: "Fluent",
      proficiency: 95,
    },
  ],

  projects: [
    {
      title: "Al-Baraka Hospital Website",
      description: "A comprehensive hospital profile website showcasing medical services and institutional information for Al-Baraka Hospital in Bahrain.",
      longDescription: "Complete institutional overview with service catalog featuring modern web design, responsive layout, and information architecture structured for easy navigation. Enhanced digital presence for healthcare services with improved patient accessibility.",
      technologies: ["React.js", "TailwindCSS", "Responsive Design", "SEO Optimization"],
      category: "Healthcare Technology",
      status: "Live Production",
      url: "http://albarakahospital.bh/",
      demoUrl: "http://albarakahospital.bh/",
      image: "/projects/hospital-placeholder.svg",
      features: [
        "Hospital Profile & Services catalog",
        "Modern web design with medical industry standards",
        "Responsive layout for all devices",
        "SEO optimized for healthcare services",
        "Fast loading times for accessibility"
      ],
      businessImpact: [
        "Enhanced digital presence for healthcare services",
        "Improved patient accessibility to hospital information",
        "Professional brand representation in medical sector"
      ],
      futureEnhancements: [
        "Advanced appointment booking system",
        "Patient portal integration", 
        "Multi-language support (Arabic/English)",
        "Telemedicine consultation features"
      ]
    },
    {
      title: "Nuammer - Luxury Materials Library Platform",
      description: "A sophisticated B2B platform serving as a curated digital hub for premium finishing and furnishing materials.",
      longDescription: "Subscription-based platform targeting interior designers and project owners in the luxury market with automated business intelligence, commission tracking, and role-based access control.",
      technologies: ["Next.js", "MongoDB Atlas", "Framer Motion", "TailwindCSS", "TypeScript"],
      category: "Luxury B2B Marketplace",
      status: "In Development",
      url: "https://nuammer.joedev.net",
      demoUrl: "https://nuammer.joedev.net",
      image: "/projects/nuammer-placeholder.svg",
      features: [
        "Multi-role authentication (Guests, Clients, Designers, Suppliers)",
        "Comprehensive material catalog with advanced search",
        "Subscription management at 39 BHD premium access",
        "Automated lead generation and supplier notifications",
        "Commission tracking and automated invoicing",
        "PDF catalog downloads and 3D file integration"
      ],
      businessImpact: [
        "Streamlined material sourcing for designers",
        "Automated lead generation for suppliers",
        "Passive income through subscriptions and commissions",
        "Enhanced industry networking and connections"
      ],
      futureEnhancements: [
        "WhatsApp API integration",
        "OpenAI image recognition for material matching",
        "Advanced analytics dashboard",
        "Mobile application development"
      ]
    },
    {
      title: "Palm Properties Management System (PPMS)",
      description: "A comprehensive property management solution for rental property operators and property management companies.",
      longDescription: "Complete system for operational efficiency and financial oversight with property-wise performance analytics, tenant management, and automated contract processing.",
      technologies: ["Next.js", "MongoDB Atlas", "TailwindCSS", "TypeScript", "Chart.js"],
      category: "Property Management",
      status: "In Development",
      url: "https://ppms.joedev.net",
      demoUrl: "https://ppms.joedev.net",
      image: "/projects/ppms-placeholder.svg",
      features: [
        "Property & unit-wise income/expense monitoring",
        "Occupancy management and reservation tracking",
        "KYC documentation with secure document storage",
        "Automated contract processing and invoicing",
        "General ledger with standard accounting reports",
        "Post-dated cheque tracking and payment monitoring",
        "Comprehensive operational dashboards"
      ],
      businessImpact: [
        "Elimination of manual workflows",
        "Real-time property performance monitoring",
        "Automated compliance and payment tracking",
        "Scalable system designed for business expansion"
      ],
      futureEnhancements: [
        "Mobile application for field operations",
        "Advanced financial analytics",
        "Integration with accounting software",
        "Automated rent collection system"
      ]
    },
    {
      title: "JoeDev.net - Personal Portfolio & Brand",
      description: "Modern, responsive portfolio website showcasing full-stack development expertise and professional projects.",
      longDescription: "Comprehensive portfolio platform featuring modern design, interactive animations, project showcases, and professional contact management. Built with cutting-edge technologies and optimized for performance.",
      technologies: ["React.js", "TypeScript", "TailwindCSS", "Framer Motion", "EmailJS"],
      category: "Portfolio & Personal Brand",
      status: "Live Production",
      url: "https://joedev.net",
      demoUrl: "https://joedev.net",
      github: "https://github.com/joe7mohamed/joedev",
      image: "/projects/joedev-placeholder.svg",
      features: [
        "Modern responsive design with dark/light theme support",
        "Interactive project showcases with live demos",
        "Professional contact form with EmailJS integration",
        "Smooth animations and transitions with Framer Motion",
        "SEO optimized for professional visibility",
        "Performance optimized with lazy loading and code splitting"
      ],
      businessImpact: [
        "Professional online presence and personal branding",
        "Client acquisition through portfolio showcase",
        "Demonstration of technical expertise and design skills",
        "Direct client contact and consultation booking system"
      ],
      futureEnhancements: [
        "Blog integration for technical articles",
        "Client testimonials and case studies section",
        "Advanced analytics and visitor tracking",
        "Multi-language support for international clients"
      ]
    }
  ],

};