/**
 * LoginPage - Modern split-screen authentication page
 * Left: Branding with animated gradient mesh
 * Right: Login form with new Input components
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';
import type { LoginDto } from '../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
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
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-300 text-lg">טוען...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-mesh"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-transparent" />

        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Heart className="w-8 h-8 text-rose-400/30" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-8">
              <Sparkles className="w-16 h-16 text-gold-400 mx-auto mb-4" />
            </div>
            <h1 className="text-6xl font-display font-bold text-white mb-4">
              Hayde
            </h1>
            <p className="text-2xl text-gray-200 mb-6">
              תכנון חתונה חכם ופשוט
            </p>
            <p className="text-lg text-gray-300 max-w-md">
              נהל את כל ההיבטים של החתונה שלך במקום אחד - תקציב, אורחים, ספקים ועוד
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            className="mt-12 space-y-4 text-right"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: '💰', text: 'ניהול תקציב מתקדם' },
              { icon: '👥', text: 'מעקב אורחים וRSVP' },
              { icon: '📊', text: 'דוחות וסטטיסטיקות' },
              { icon: '📱', text: 'נגיש בכל מקום' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-gray-200"
                variants={staggerItem}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-lg">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-gradient-purple mb-2">
              Hayde
            </h1>
            <p className="text-gray-400">ברוכים הבאים בחזרה</p>
          </div>

          {/* Login Card */}
          <motion.div
            className="bg-surface-primary border border-border-subtle rounded-2xl shadow-2xl p-8"
            whileHover={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-gray-50 mb-2">
                התחברות
              </h2>
              <p className="text-gray-400">היכנס לחשבון שלך</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <Input
                type="email"
                name="email"
                label="כתובת מייל"
                value={formData.email}
                onChange={handleInputChange}
                leftIcon={<Mail className="w-5 h-5" />}
                placeholder="example@email.com"
                required
                disabled={loading}
                fullWidth
              />

              {/* Password Field */}
              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="סיסמה"
                  value={formData.password}
                  onChange={handleInputChange}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                    >
                      {showPassword ? '👁️' : '🔒'}
                    </button>
                  }
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  fullWidth
                />

                {/* Forgot Password Link */}
                <div className="mt-2 text-left">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-1"
                  >
                    שכחת סיסמה?
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
                className="mt-8"
              >
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-primary text-gray-400">או</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">אין לך חשבון?</p>
              <Link to="/register">
                <Button variant="secondary" fullWidth>
                  הירשם עכשיו
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה לדף הבית
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
