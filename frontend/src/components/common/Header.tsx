import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface HeaderProps {
  title: string;
  backTo?: string;
}

function Header({ title, backTo }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 mb-8 bg-slate-950/70 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backTo && (
            <Button variant="ghost" size="sm" onClick={() => navigate(backTo)} type="button">
              ← חזרה
            </Button>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* actions slot (future) */}
        </div>
      </div>
    </div>
  );
}

export default Header;
