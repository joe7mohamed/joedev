import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { setLoading, setHasLoadedInitially, setPortfolioData } from './store/slices/appSlice';
import { useLocalStorage } from './hooks/useLocalStorage';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ServicesSection from './components/ServicesSection';
import ExperienceTimeline from './components/ExperienceTimeline';
import PortfolioSection from './components/PortfolioSection';
import ContactSection from './components/ContactSection';
import FooterSection from './components/FooterSection';
import AdminApp from './components/admin/AdminApp';

function MainContent() {
  const dispatch = useAppDispatch();
  const { isLoading, hasLoadedInitially } = useAppSelector((state) => state.app);
  const [cachedData] = useLocalStorage('portfolioCache', null);

  useEffect(() => {
    const initializeApp = async () => {
      if (cachedData && !hasLoadedInitially) {
        dispatch(setPortfolioData(cachedData));
        dispatch(setHasLoadedInitially(true));
        dispatch(setLoading(false));
      } else {
        const timer = setTimeout(() => {
          dispatch(setLoading(false));
          dispatch(setHasLoadedInitially(true));
        }, 800);
        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, [dispatch, cachedData, hasLoadedInitially]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ServicesSection />
        <ExperienceTimeline />
        <PortfolioSection />
        <ContactSection />
      </main>
      <FooterSection />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="*" element={<MainContent />} />
        </Routes>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App
