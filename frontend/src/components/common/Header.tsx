/**
 * Header Component
 * Modern sticky header with backdrop blur, navigation, and wedding countdown
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Heart, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from './Button';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wedding, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Backdrop blur intensity based on scroll
  const backdropBlur = useTransform(scrollY, [0, 100], [0, 16]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0.1, 0.3]);

  const navigationItems = [
    { path: '/dashboard', label: 'דף בית', icon: Heart },
    { path: '/categories', label: 'הוצאות', icon: Calendar },
    { path: '/guests', label: 'מוזמנים', icon: Calendar },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Calculate days until wedding
  const getDaysUntilWedding = (): number | null => {
    if (!wedding?.wedding_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weddingDate = new Date(wedding.wedding_date);
    weddingDate.setHours(0, 0, 0, 0);

    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilWedding = getDaysUntilWedding();

  return (
    <>
      <motion.header
        className="sticky top-0 z-30 border-b"
        style={{
          backdropFilter: `blur(${backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${backdropBlur}px)`,
          borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
        }}
      >
        <div className="bg-background-primary/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: User Info & Logout (appears on right in RTL) */}
              <div className="flex items-center gap-4">
                {isAuthenticated && user && (
                  <>
                    {/* Wedding Info - Desktop */}
                    <div className="hidden lg:flex flex-col items-end">
                      {wedding && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gradient-purple">
                              חתונת {wedding.bride_name} ו{wedding.groom_name}
                            </span>
                            <Heart className="w-4 h-4 text-rose-400" />
                          </div>
                          {daysUntilWedding !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-400">
                                {daysUntilWedding > 0
                                  ? `${daysUntilWedding} ימים עד החתונה`
                                  : daysUntilWedding === 0
                                  ? 'היום החתונה! 🎉'
                                  : 'החתונה עברה'}
                              </span>
                              <Calendar className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Logout Button - Desktop */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      leftIcon={<LogOut className="w-4 h-4" />}
                      className="hidden md:flex"
                    >
                      יציאה
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-secondary transition-colors"
                      aria-label="Toggle menu"
                    >
                      {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                      ) : (
                        <Menu className="w-6 h-6" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Center: Title */}
              <motion.h1
                className="absolute left-1/2 -translate-x-1/2 text-xl sm:text-2xl font-display font-bold text-gray-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h1>

              {/* Right: Navigation (appears on left in RTL) - Desktop */}
              <nav className="hidden md:flex items-center gap-2">
                {isAuthenticated && navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate(item.path)}
                      leftIcon={<Icon className="w-4 h-4" />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && mobileMenuOpen && (
        <motion.div
          className="md:hidden fixed inset-x-0 top-16 z-20 bg-surface-primary/95 backdrop-blur-lg border-b border-border-subtle shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-4 space-y-3">
            {/* Wedding Info - Mobile */}
            {wedding && (
              <div className="pb-3 border-b border-border-subtle text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-sm font-semibold text-gradient-purple">
                    חתונת {wedding.bride_name} ו{wedding.groom_name}
                  </span>
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                {daysUntilWedding !== null && (
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs text-gray-400">
                      {daysUntilWedding > 0
                        ? `${daysUntilWedding} ימים עד החתונה`
                        : daysUntilWedding === 0
                        ? 'היום החתונה! 🎉'
                        : 'החתונה עברה'}
                    </span>
                    <Calendar className="w-3 h-3 text-gray-500" />
                  </div>
                )}
              </div>
            )}

            {/* Navigation - Mobile */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'primary' : 'ghost'}
                    size="md"
                    onClick={() => navigate(item.path)}
                    leftIcon={<Icon className="w-4 h-4" />}
                    fullWidth
                  >
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Logout - Mobile */}
            <Button
              variant="danger"
              size="md"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              fullWidth
            >
              יציאה
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default Header;
