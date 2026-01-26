import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Header from '../components/common/Header';
import { Button } from '@/components/ui/button';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6 sm:p-7">
      <div className="max-w-6xl mx-auto">
        <Header title="עמוד לא נמצא" />

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-card border rounded-xl shadow-lg p-12 max-w-md w-full text-center">
            {/* 404 Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                <FileQuestion
                  className="w-12 h-12 text-destructive"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* 404 Number */}
            <h1 className="text-6xl font-extrabold text-foreground mb-4">
              404
            </h1>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-muted-foreground mb-3">
              עמוד לא נמצא
            </h2>

            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              מצטערים, העמוד שחיפשת לא קיים או הועבר למקום אחר.
            </p>

            {/* Back to Dashboard Button */}
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              חזרה לדף הבית
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
