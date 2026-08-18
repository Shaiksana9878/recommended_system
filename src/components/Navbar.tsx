import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Zap,
  Bookmark,
  History,
  User,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Sparkles, authRequired: true },
    { name: 'Explore', path: '/explore', icon: Compass, authRequired: false },
    { name: 'My Interests', path: '/interests', icon: Zap, authRequired: true },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles, authRequired: true },
    { name: 'Saved', path: '/saved', icon: Bookmark, authRequired: true },
    { name: 'History', path: '/history', icon: History, authRequired: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#06060A]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#06060A] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-white tracking-tight">TechReel</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Scroll Intelligence for Tech</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {user ? (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/explore" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Explore Demo
              </Link>
              <Link to="/help" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link to="/privacy" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          )}

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-full bg-[#141424] border border-white/10 hover:border-violet-500/40 transition-colors"
                >
                  <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.full_name)}`}
                    alt="avatar"
                    className="w-7 h-7 rounded-full bg-violet-950 border border-violet-500/30"
                  />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#0E0E17] border border-white/10 rounded-xl shadow-2xl z-50 py-2 divide-y divide-white/10">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <User className="w-4 h-4 text-violet-400" />
                          <span>Profile & Goals</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <Settings className="w-4 h-4 text-cyan-400" />
                          <span>AI Preferences</span>
                        </Link>
                        <Link
                          to="/help"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                          <span>Help & FAQ</span>
                        </Link>
                        <Link
                          to="/feedback"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-400" />
                          <span>Submit Feedback</span>
                        </Link>
                        <Link
                          to="/privacy"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span>Privacy Policy</span>
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#141424] border border-white/10 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A12] border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl mb-3">
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.full_name)}`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full bg-violet-950 border border-violet-500/30"
                />
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-violet-400" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-white/10 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                >
                  <User className="w-4 h-4 text-violet-400" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help</span>
                </Link>
                <Link
                  to="/feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Feedback</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                Explore Reels
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                How It Works
              </Link>
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-slate-200"
              >
                Privacy
              </Link>
              <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium bg-[#141424] text-white border border-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
