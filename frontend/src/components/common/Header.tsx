import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface HeaderProps {
  title: string;
  backTo?: string;
}

function Header({ title, backTo }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-3 mb-8 sm:mb-6 bg-slate-950/70 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto relative flex items-center justify-center">
        {backTo && (
          <div className="absolute left-0">
            <Button variant="ghost" size="sm" onClick={() => navigate(backTo)} type="button">
              חזור ←
            </Button>
          </div>
        )}
        <h1 className="text-2xl sm:text-2xl md:text-xl font-extrabold text-gray-100 leading-tight text-center">
          {title}
        </h1>
        <div className="absolute right-0 flex items-center gap-2">
        </div>
      </div>
    </div>
  );
}

export default Header;
