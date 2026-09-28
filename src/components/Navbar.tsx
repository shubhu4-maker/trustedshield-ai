import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ScanSearch,
  Globe,
  LayoutDashboard,
  Lock,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Shield },
  { path: '/analyze', label: 'Analyze', icon: ScanSearch },
  { path: '/feed', label: 'Threat Feed', icon: Globe },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/about', label: 'About', icon: Info },
  { path: '/privacy', label: 'Privacy', icon: Lock },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        // Safe offline catch
      });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch {
      // Safe offline catch
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured on this deployment. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings → Environment Variables and redeploy.');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } },
        });
        if (error) throw error;
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
        setAuthError('Connection to Supabase failed ("Failed to fetch"). Please verify that VITE_SUPABASE_URL is configured in your Vercel Environment Variables and that Supabase is accessible.');
      } else if (msg.includes('rate limit')) {
        setAuthError('Email rate limit exceeded. In your Supabase Dashboard, go to Authentication → Providers → Email and disable "Confirm email" for instant login.');
      } else {
        setAuthError(msg || 'Authentication failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <ShieldCheck className="w-8 h-8 text-brand-500 group-hover:text-brand-400 transition-colors" />
                <div className="absolute inset-0 bg-brand-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">Trust</span>
                <span className="text-brand-400">Shield</span>
                <span className="text-surface-500 ml-1 text-sm font-medium">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'text-white bg-brand-500/10'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/analyze"
                className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
              >
                <ScanSearch className="w-4 h-4" />
                Scan Now
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-xs text-surface-300 max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button onClick={handleSignOut} className="btn-ghost text-sm" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setAuthMode('login');
                  }}
                  className="btn-ghost text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden btn-ghost"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-surface-800"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${location.pathname === path
                        ? 'text-white bg-brand-500/10 border border-brand-500/20'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-brand-500" />
                <h2 className="text-xl font-bold">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="input-field"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email Address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="input-field"
                  minLength={6}
                  required
                />

                {authError && (
                  <p className="text-sm text-rose-400 bg-rose-500/10 px-4 py-2 rounded-lg">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'login'
                    ? 'Sign In'
                    : 'Create Account'}
                </button>
              </form>

              <p className="text-sm text-surface-400 text-center mt-4">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="text-brand-400 hover:text-brand-300 font-medium"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-brand-400 hover:text-brand-300 font-medium"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
