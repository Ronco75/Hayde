import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import type { LoginDto } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      // Redirect is handled by useEffect after successful login
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by axios interceptor
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-gray-300 text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">
            Hayde
          </h1>
          <p className="text-gray-400">ברוכים הבאים בחזרה</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
            התחברות
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                כתובת מייל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                placeholder="example@email.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                סיסמה
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              אין לך חשבון?{' '}
              <Link
                to="/register"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                הירשם עכשיו
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
