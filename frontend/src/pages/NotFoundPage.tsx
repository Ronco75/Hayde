import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import Header from '../components/common/Header';
import Button from '../components/common/Button';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-7">
      <div className="max-w-6xl mx-auto">
        <Header title="עמוד לא נמצא" />

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-12 max-w-md w-full text-center">
            {/* 404 Icon */}
            <div className="flex justify-center mb-6">
              <FileQuestion
                className="w-24 h-24 text-red-400/70"
                strokeWidth={1.5}
              />
            </div>

            {/* 404 Number */}
            <h1 className="text-6xl font-extrabold text-gray-100 mb-4">
              404
            </h1>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-200 mb-3">
              עמוד לא נמצא
            </h2>

            {/* Description */}
            <p className="text-gray-400 mb-8 leading-relaxed">
              מצטערים, העמוד שחיפשת לא קיים או הועבר למקום אחר.
            </p>

            {/* Back to Dashboard Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              type="button"
              className="w-full"
            >
              חזרה לדף הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
