import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, wedding, logout, isAuthenticated } = useAuth();

  const navigationItems = [
    { path: '/dashboard', label: 'דף בית' },
    { path: '/categories', label: 'הוצאות' },
    { path: '/guests', label: 'מוזמנים' },
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

  // Calculate days until wedding
  const getDaysUntilWedding = (): number | null => {
    if (!wedding?.wedding_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    const weddingDate = new Date(wedding.wedding_date);
    weddingDate.setHours(0, 0, 0, 0);

    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilWedding = getDaysUntilWedding();

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-3 mb-8 sm:mb-6 bg-slate-950/70 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto relative flex items-center justify-between">
        {/* Left Side (appears on right in RTL) - User Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user && (
            <>
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                {wedding && (
                  <>
                    <span className="text-xs font-semibold text-primary-400">
                      חתונת {wedding.bride_name} ו{wedding.groom_name}
                    </span>
                    {daysUntilWedding !== null && (
                      <span className="text-xs text-gray-400">
                        {daysUntilWedding > 0
                          ? `${daysUntilWedding} ימים עד החתונה`
                          : daysUntilWedding === 0
                          ? '🎉 היום החתונה!'
                          : 'החתונה עברה'}
                      </span>
                    )}
                  </>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                יציאה
              </Button>
            </>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="text-2xl sm:text-2xl md:text-xl font-extrabold text-gray-100 leading-tight text-center absolute left-1/2 transform -translate-x-1/2">
          {title}
        </h1>

        {/* Right Side (appears on left in RTL) - Navigation */}
        <div className="flex items-center gap-2">
          {isAuthenticated && navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              type="button"
              className={isActive(item.path) ? 'bg-primary-600/20 text-primary-300' : ''}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;
