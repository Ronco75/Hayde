import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { ArrowRight, Mail, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim()) {
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Error is handled by axios interceptor and AuthContext
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">
            Hayde
          </h1>
          <p className="text-gray-400">
            {emailSent ? 'נשלח קישור לאיפוס סיסמה' : 'שכחת סיסמה?'}
          </p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-100 mb-2 text-center">
                איפוס סיסמה
              </h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס סיסמה
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    כתובת מייל
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pr-11 pl-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  disabled={loading || !email.trim()}
                >
                  {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-100 mb-3">
                  קישור נשלח!
                </h2>

                <p className="text-gray-400 text-sm mb-2">
                  אם המייל <span className="text-primary-400 font-medium">{email}</span> קיים במערכת,
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  נשלח אליו קישור לאיפוס הסיסמה תוך מספר דקות.
                </p>

                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-4 mb-6 text-right">
                  <p className="text-xs text-gray-400 mb-2">
                    💡 <strong>טיפ:</strong>
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>בדוק גם בתיקיית ספאם/דואר זבל</li>
                    <li>הקישור תקף לשעה אחת בלבד</li>
                    <li>ניתן לשלוח שוב לאחר 15 דקות</li>
                  </ul>
                </div>

                {/* Resend button */}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mb-3"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  שלח שוב
                </Button>
              </div>
            </>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-primary-400 hover:text-primary-300 transition-colors group"
            >
              <span>חזרה להתחברות</span>
              <ArrowRight className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Register Link */}
        {!emailSent && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              עדיין אין לך חשבון?{' '}
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                הירשם כאן
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
