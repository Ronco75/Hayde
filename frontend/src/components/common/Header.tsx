import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface HeaderProps {
  title: string;
  backTo?: string;
}

function Header({ title, backTo }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <nav className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-purple-900/30 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {backTo && (
            <div className="order-1 w-full sm:w-auto flex justify-center sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => navigate(backTo)}
                type="button"
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <span>←</span>
                  <span>חזרה</span>
                </span>
              </Button>
            </div>
          )}

          <h1 className="order-2 text-2xl sm:text-3xl font-bold text-white text-center sm:text-right w-full drop-shadow-lg">
            {title}
          </h1>
        </div>
      </nav>
    </div>
  );
}

export default Header;
