import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, FileText, Menu, X, Github, Shield, Zap } from 'lucide-react';

export const Header: React.FC<{ toggleTheme: () => void; isDark: boolean }> = ({ toggleTheme, isDark }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
          <div className="bg-brand-600 text-white p-1.5 rounded-lg">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <span>ExePDF</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">All Tools</Link>
          <a href="#features" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
          <a href="#privacy" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy</a>
          <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-base font-medium">All Tools</Link>
            <button onClick={() => { toggleTheme(); setIsOpen(false); }} className="flex items-center gap-2 text-base font-medium">
                {isDark ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
            </button>
        </div>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12 mt-auto">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 font-bold text-lg mb-4">
          <div className="bg-brand-600 text-white p-1 rounded">
            <FileText size={16} />
          </div>
          ExePDF
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          The ultimate privacy-focused PDF toolset. Fully local processing means your files never leave your device.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Legal & Privacy</h3>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-center gap-2"><Shield size={14} /> No Data Retention</li>
          <li className="flex items-center gap-2"><Shield size={14} /> No Cloud Uploads</li>
          <li className="flex items-center gap-2"><Shield size={14} /> GDPR Compliant</li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Project</h3>
        <div className="flex items-center gap-4">
             <a href="#" className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors">
                <Github size={20} />
             </a>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-400">
      © {new Date().getFullYear()} ExePDF. Built for privacy.
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode; toggleTheme: () => void; isDark: boolean }> = ({ children, toggleTheme, isDark }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header toggleTheme={toggleTheme} isDark={isDark} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};