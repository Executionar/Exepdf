import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { ToolWorkspace } from './pages/ToolWorkspace';

export default function App() {
  // Theme Management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <Layout toggleTheme={toggleTheme} isDark={isDark}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tool/:id" element={<ToolWorkspace />} />
        </Routes>
      </Layout>
    </Router>
  );
}