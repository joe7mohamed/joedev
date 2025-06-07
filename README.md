# 🚀 JoeDev.net - Professional Portfolio Website

<div align="center">

![Portfolio Banner](https://via.placeholder.com/1200x300/1e293b/38bdf8?text=JoeDev.net+Portfolio)

**Modern Full-Stack Developer Portfolio & Personal Brand**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-joedev.net-38bdf8?style=for-the-badge)](https://joedev.net)
[![Build Status](https://img.shields.io/badge/✅_Build-Passing-success?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/📄_License-MIT-blue?style=for-the-badge)](#license)

</div>

---

## 🎯 **Project Overview**

A cutting-edge portfolio website showcasing full-stack development expertise, featuring modern design, interactive animations, and professional project presentations. Built with performance and user experience as top priorities.

### ✨ **Key Features**

- 🎨 **Modern Design**: Clean, professional interface with dark/light theme support
- 📱 **Fully Responsive**: Optimized for all devices and screen sizes
- ⚡ **High Performance**: Fast loading with code splitting and optimization
- 🎭 **Interactive Animations**: Smooth transitions using Framer Motion
- 📧 **Contact Integration**: Professional contact form with EmailJS
- 🌟 **Project Showcase**: Dynamic portfolio with live project links
- 🔍 **SEO Optimized**: Enhanced visibility and search engine ranking

---

## 🛠️ **Tech Stack**

### **Frontend**
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

### **Styling & UI**
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat&logo=radix-ui&logoColor=white)

### **State Management & Logic**
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white)

### **Communication & Services**
![EmailJS](https://img.shields.io/badge/EmailJS-FF6B6B?style=flat&logo=gmail&logoColor=white)

### **Development & Build**
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A?style=flat&logo=postcss&logoColor=white)

### **Deployment**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## 🏗️ **Architecture & Structure**

```
src/
├── 📂 components/          # Reusable UI components
│   ├── 🎨 ui/             # Base UI components (buttons, cards, etc.)
│   ├── 📄 AboutSection.tsx
│   ├── 📞 ContactSection.tsx
│   ├── 🏠 HeroSection.tsx
│   ├── 💼 PortfolioSection.tsx
│   └── 🛠️ SkillsSection.tsx
├── 📂 contexts/           # React context providers
│   └── 🌙 ThemeContext.tsx
├── 📂 data/              # Static data and configuration
│   └── 📊 portfolio.ts
├── 📂 hooks/             # Custom React hooks
│   ├── 🔗 redux.ts
│   └── 💾 useLocalStorage.ts
├── 📂 lib/               # Utility libraries
│   └── 🛠️ utils.ts
├── 📂 services/          # External service integrations
│   └── 📧 emailService.ts
├── 📂 store/             # Redux store configuration
│   ├── 📦 index.ts
│   └── 🔄 slices/
└── 📂 utils/             # Helper utilities
    └── ⚡ performanceUtils.ts
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Installation**

```bash
# Clone the repository
git clone https://github.com/youssef7mohamed/joedev-portfolio.git

# Navigate to project directory
cd joedev-portfolio

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Application Configuration
VITE_APP_ENV=development
VITE_APP_NAME=JoeDev Portfolio
VITE_DOMAIN=localhost:5173

# EmailJS Configuration (Optional)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 📋 **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 🏗️ Build for production |
| `npm run preview` | 👀 Preview production build |
| `npm run lint` | 🔍 Run ESLint |

---

## 🎨 **Features Showcase**

### **🎭 Interactive Portfolio**
- Dynamic project filtering by category
- Smooth hover animations and transitions
- Live project links with status indicators
- Technology stack highlighting

### **📱 Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-optimized interactions
- Progressive enhancement

### **⚡ Performance Optimizations**
- Code splitting and lazy loading
- Optimized asset delivery
- Efficient state management
- Minimal bundle size

### **📧 Professional Contact**
- EmailJS integration for direct communication
- Form validation and error handling
- Loading states and user feedback
- Professional email templates

---

## 🌟 **Project Highlights**

### **Live Projects Featured:**

1. **🏥 Al-Baraka Hospital Website**
   - Healthcare industry website
   - Modern design with medical standards
   - SEO optimized for healthcare services

2. **💎 Nuammer - Luxury Materials Library**
   - B2B marketplace platform
   - Next.js with MongoDB Atlas
   - Subscription-based business model

3. **🏠 Palm Properties Management System**
   - Property management solution
   - Financial tracking and analytics
   - Next.js with MongoDB Atlas

4. **🌐 JoeDev.net Portfolio**
   - This portfolio website
   - Modern React.js application
   - Full-stack development showcase

---

## 🔧 **Development Workflow**

### **Code Quality**
- TypeScript for type safety
- ESLint for code consistency
- Component-based architecture
- Custom hooks for reusability

### **State Management**
- Redux Toolkit for global state
- Context API for theme management
- Local storage for persistence
- Optimized selectors and actions

### **Styling Approach**
- Utility-first with TailwindCSS
- Component variants with CVA
- Responsive design tokens
- Dark/light theme support

---

## 📈 **Performance Metrics**

- ⚡ **Lighthouse Score**: 90+
- 🚀 **First Contentful Paint**: < 1.5s
- 📱 **Mobile Performance**: 85+
- 🎯 **SEO Score**: 95+
- ♿ **Accessibility**: 90+

---

## 🚀 **Deployment**

### **Vercel Deployment**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youssef7mohamed/joedev-portfolio)

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### **Environment Setup for Production**
1. Configure EmailJS service
2. Set up custom domain (joedev.net)
3. Configure environment variables in Vercel
4. Enable analytics (optional)

---

## 📧 **EmailJS Setup**

1. Create account at [EmailJS.com](https://emailjs.com)
2. Create email service (Gmail recommended)
3. Create email template with these variables:
   - `{{from_name}}` - Contact's name
   - `{{from_email}}` - Contact's email
   - `{{company}}` - Company name
   - `{{project_type}}` - Project type
   - `{{message}}` - Main message
   - `{{wants_consultation}}` - Free consultation request
   - `{{timestamp}}` - Submission time

4. Add credentials to Vercel environment variables

---

## 🤝 **Contributing**

While this is a personal portfolio, feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Developer**

**Youssef Mohamed Ibrahim**
- 🌐 Portfolio: [joedev.net](https://joedev.net)
- 📧 Email: youssef.m.ibrahim.zaky@gmail.com
- 💼 LinkedIn: [youssef7mohamed](https://linkedin.com/in/youssef7mohamed)
- 🐱 GitHub: [youssef7mohamed](https://github.com/youssef7mohamed)

---

## 🙏 **Acknowledgments**

- **Design Inspiration**: Modern portfolio trends and UI/UX best practices
- **Technology Stack**: React ecosystem and modern web development tools
- **Community**: Open source contributors and the developer community

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

![Made with ❤️](https://img.shields.io/badge/Made_with-❤️-red?style=for-the-badge)
![Powered by](https://img.shields.io/badge/Powered_by-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)

</div>