import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import RegisterPage from './pages/RegisterPage';
import CommunicationPage from './pages/CommunicationPage';
import FloatingChatBot from './components/FloatingChatBot';
import Navbar from './components/Navbar';

import { GoogleOAuthProvider } from '@react-oauth/google';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/patient" element={<PageTransition><PatientDashboard /></PageTransition>} />
        <Route path="/doctor" element={<PageTransition><DoctorDashboard /></PageTransition>} />
        <Route path="/guardian" element={<PageTransition><GuardianDashboard /></PageTransition>} />
        <Route path="/communication" element={<PageTransition><CommunicationPage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Navbar />
      <div className={isLandingPage ? 'min-h-screen' : 'pt-20 md:pt-24 min-h-screen'}>
        <AnimatedRoutes />
      </div>
      <FloatingChatBot />
    </>
  );
};

export default function App() {
  const googleClientId = "574509833617-t5m8eq7ta77sok9lcpc0qb0rvcha9ep2.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <AppContent />
      </Router>
    </GoogleOAuthProvider>
  );
}
