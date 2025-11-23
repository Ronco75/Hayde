import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { ArrowRight, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await authApi.verifyResetToken(token);
        setTokenValid(response.data.valid);
      } catch (error) {
        console.error('Token verification failed:', error);
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('הסיסמאות אינן תואמות');
      return;
    }

    if (!token) {
      toast.error('טוקן לא תקין');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      setPasswordReset(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      // Error is handled by axios interceptor and AuthContext
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">מאמת קישור...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">
              Hayde
            </h1>
            <p className="text-gray-400">קישור לא תקין</p>
          </div>

          {/* Error Card */}
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-100 mb-3">
                קישור לא תקין או פג תוקף
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                קישור איפוס הסיסמה אינו תקין או שפג תוקפו (תקף לשעה אחת בלבד).
              </p>

              <Button
                variant="primary"
                className="w-full mb-3"
                onClick={() => navigate('/forgot-password')}
              >
                בקש קישור חדש
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-primary-400 hover:text-primary-300 transition-colors group mt-4"
              >
                <span>חזרה להתחברות</span>
                <ArrowRight className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state after password reset
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">
              Hayde
            </h1>
            <p className="text-gray-400">הסיסמה אופסה בהצלחה</p>
          </div>

          {/* Success Card */}
          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-100 mb-3">
                הסיסמה שונתה בהצלחה!
              </h2>

              <p className="text-gray-400 text-sm mb-6">
                כעת תוכל להתחבר עם הסיסמה החדשה שלך.
              </p>

              <p className="text-xs text-gray-500 mb-6">
                מעביר אותך להתחברות תוך 3 שניות...
              </p>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                התחבר עכשיו
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">
            Hayde
          </h1>
          <p className="text-gray-400">צור סיסמה חדשה</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-2 text-center">
            איפוס סיסמה
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            הזן את הסיסמה החדשה שלך
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                סיסמה חדשה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pr-11 pl-11 py-3 bg-slate-800 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="לפחות 6 תווים"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                הסיסמה חייבת להכיל לפחות 6 תווים
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                אימות סיסמה
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-11 pl-11 py-3 bg-slate-800 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="הזן שוב את הסיסמה"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
            >
              {loading ? 'מעדכן סיסמה...' : 'עדכן סיסמה'}
            </Button>
          </form>

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
      </div>
    </div>
  );
};

export default ResetPasswordPage;
