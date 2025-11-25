/**
 * RegisterPage - Modern split-screen registration page
 * Matches LoginPage design with enhanced password strength indicator
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, ArrowRight, Sparkles, UserPlus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(null);
      return;
    }

    const length = formData.password.length;
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (length < 6) {
      setPasswordStrength('weak');
    } else if (length >= 6 && length < 10) {
      setPasswordStrength('medium');
    } else if (length >= 10 && (hasNumbers || hasSpecialChars)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('הסיסמאות אינן תואמות');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    try {
      setLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
      });
      navigate('/wedding-setup');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password strength indicator
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'strong': return 'bg-emerald-500';
      default: return 'bg-gray-600';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'חלשה';
      case 'medium': return 'בינונית';
      case 'strong': return 'חזקה';
      default: return '';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
        <div className="absolute inset-0 bg-gradient-to-br from-gold-900/40 via-primary-800/30 to-transparent" />

        {/* Floating sparkles animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              <Sparkles className="w-6 h-6 text-gold-400/40" />
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
            <UserPlus className="w-20 h-20 text-primary-400 mx-auto mb-6" />
            <h1 className="text-6xl font-display font-bold text-white mb-4">
              הצטרפו אלינו
            </h1>
            <p className="text-2xl text-gray-200 mb-6">
              התחילו לתכנן את החתונה המושלמת
            </p>
            <p className="text-lg text-gray-300 max-w-md">
              הצטרפו לאלפי זוגות שמנהלים את החתונה שלהם בצורה חכמה ויעילה
            </p>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            className="mt-12 space-y-4 text-right"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: '🎯', text: 'תכנון מסודר ויעיל' },
              { icon: '💝', text: 'כלים חכמים לניהול' },
              { icon: '⚡', text: 'חיסכון בזמן ובכסף' },
              { icon: '🎊', text: 'חתונה מושלמת מובטחת' },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-gray-200"
                variants={staggerItem}
              >
                <span className="text-2xl">{benefit.icon}</span>
                <span className="text-lg">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Registration Form */}
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
            <p className="text-gray-400">תתחילו לתכנן את החתונה המושלמת</p>
          </div>

          {/* Registration Card */}
          <motion.div
            className="bg-surface-primary border border-border-subtle rounded-2xl shadow-2xl p-8"
            whileHover={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-gray-50 mb-2">
                הרשמה
              </h2>
              <p className="text-gray-400">צרו חשבון חדש</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="לפחות 6 תווים"
                  helperText="לפחות 6 תווים, מומלץ להוסיף מספרים ותווים מיוחדים"
                  required
                  disabled={loading}
                  fullWidth
                />

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <motion.div
                    className="mt-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">חוזק הסיסמה:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getStrengthColor()}`}
                        initial={{ width: 0 }}
                        animate={{ width: getStrengthWidth() }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="אימות סיסמה"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                      aria-label={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                    >
                      {showConfirmPassword ? '👁️' : '🔒'}
                    </button>
                  }
                  placeholder="הזן את הסיסמה שוב"
                  required
                  disabled={loading}
                  fullWidth
                />

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <motion.div
                    className="mt-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        הסיסמאות תואמות
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <span>✗</span>
                        הסיסמאות אינן תואמות
                      </span>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                loading={loading}
                fullWidth
                className="mt-8"
                leftIcon={<UserPlus className="w-5 h-5" />}
              >
                {loading ? 'נרשם...' : 'הירשם והתחל'}
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">כבר יש לך חשבון?</p>
              <Link to="/login">
                <Button variant="secondary" fullWidth>
                  התחבר
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

export default RegisterPage;
