import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-gray-300 text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-slate-950 to-slate-950 z-0" />

        {/* Decorative Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 sm:py-32">
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 mb-6 animate-[slideDown_0.5s_ease-out]">
              Hayde
            </h1>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-100 mb-6 leading-tight animate-[slideDown_0.6s_ease-out]">
              תכנון החתונה המושלם שלכם
            </h2>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-[slideDown_0.7s_ease-out]">
              נהלו את כל פרטי החתונה במקום אחד - הוצאות, אורחים, משימות ועוד
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[slideDown_0.8s_ease-out]">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  התחילו עכשיו
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  כניסה למערכת
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-slate-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-100 text-center mb-12">
            כל מה שאתם צריכים לחתונה מושלמת
          </h3>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Budget Management */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-102 shadow-elev-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h4 className="text-xl font-bold text-gray-100 mb-3">
                ניהול תקציב והוצאות חכם
              </h4>
              <p className="text-gray-400 leading-relaxed">
                עקבו אחר כל ההוצאות, התקציב והתשלומים במקום אחד. נהלו קטגוריות ותראו בזמן אמת כמה נשאר.
              </p>
            </div>

            {/* Feature 2: Guest List */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-102 shadow-elev-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h4 className="text-xl font-bold text-gray-100 mb-3">
                רשימת מוזמנים ואישורי הגעה
              </h4>
              <p className="text-gray-400 leading-relaxed">
                נהלו את כל המוזמנים, עקבו אחר אישורי ההגעה ושלחו תזכורות בקלות. תמיד תדעו מי מגיע!
              </p>
            </div>

            {/* Feature 3: Groups */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-102 shadow-elev-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">🏘️</span>
              </div>
              <h4 className="text-xl font-bold text-gray-100 mb-3">
                ארגון קבוצות ומשפחות
              </h4>
              <p className="text-gray-400 leading-relaxed">
                ארגנו את האורחים לפי משפחות, חברים ועמיתים לעבודה. קל יותר לנהל ולתכנן!
              </p>
            </div>

            {/* Feature 4: Dashboard */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-102 shadow-elev-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-100 mb-3">
                Dashboard מרכזי לכל המידע
              </h4>
              <p className="text-gray-400 leading-relaxed">
                צפו בכל המידע החשוב במקום אחד - סטטיסטיקות, תקציב, אורחים וגרפים מפורטים.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-primary-900/20 via-slate-900 to-slate-950 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-6">
            מוכנים להתחיל?
          </h3>
          <p className="text-lg text-gray-400 mb-8">
            הצטרפו עכשיו והתחילו לתכנן את החתונה המושלמת שלכם בקלות
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg">
              יצירת חשבון בחינם
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 Hayde - תכנון חתונות חכם ופשוט
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
