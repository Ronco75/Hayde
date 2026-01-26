/**
 * Header Component
 * Modern sticky header with backdrop blur, navigation, and wedding countdown
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, LogOut, Menu, X, Home, CreditCard, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; // New Button

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wedding, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Border opacity based on scroll
  const borderOpacity = useTransform(scrollY, [0, 100], [0.1, 0.3]);

  const navigationItems = [
    { path: '/dashboard', label: 'דף בית', icon: Home },
    { path: '/categories', label: 'הוצאות', icon: CreditCard },
    { path: '/guests', label: 'מוזמנים', icon: Users },
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
        className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
        style={{
          borderColor: `hsla(var(--border) / ${borderOpacity})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {isAuthenticated && navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            {/* Center: Title */}
            <motion.h1
              className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>

            {/* Right: User Info & Logout */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user && (
                <>
                  {/* Wedding Info - Desktop */}
                  <div className="hidden lg:flex flex-col items-end">
                    {wedding && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            {wedding.bride_name} & {wedding.groom_name}
                          </span>
                          <Heart className="w-4 h-4 text-primary fill-primary/20" />
                        </div>
                        {daysUntilWedding !== null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">
                              {daysUntilWedding > 0
                                ? `${daysUntilWedding} ימים עד החתונה`
                                : daysUntilWedding === 0
                                  ? 'היום החתונה! 🎉'
                                  : 'החתונה עברה'}
                            </span>
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
                    className="hidden md:flex gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    יציאה
                  </Button>

                  {/* Mobile Menu Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isAuthenticated && mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-x-0 top-16 z-20 bg-background border-b shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-3">
              {/* Wedding Info - Mobile */}
              {wedding && (
                <div className="pb-3 border-b text-right">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-primary">
                      {wedding.bride_name} & {wedding.groom_name}
                    </span>
                    <Heart className="w-4 h-4 text-primary fill-primary/20" />
                  </div>
                  {daysUntilWedding !== null && (
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">
                        {daysUntilWedding > 0
                          ? `${daysUntilWedding} ימים עד החתונה`
                          : daysUntilWedding === 0
                            ? 'היום החתונה! 🎉'
                            : 'החתונה עברה'}
                      </span>
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
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      size="default"
                      onClick={() => navigate(item.path)}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>

              {/* Logout - Mobile */}
              <Button
                variant="destructive"
                size="default"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="w-4 h-4" />
                יציאה
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
