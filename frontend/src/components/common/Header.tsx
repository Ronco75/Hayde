import { useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-3 mb-8 sm:mb-6 bg-slate-950/70 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto relative flex items-center justify-center">
        <h1 className="text-2xl sm:text-2xl md:text-xl font-extrabold text-gray-100 leading-tight text-center">
          {title}
        </h1>
        <div className="absolute right-0 flex items-center gap-2">
          {navigationItems.map((item) => (
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
