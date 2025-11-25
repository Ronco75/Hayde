/**
 * ResetPasswordPage - Modern split-screen password reset page
 * Handles token verification and password reset with animations
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, AlertCircle, CheckCircle, Key, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';

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
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

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

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(null);
      return;
    }

    const length = newPassword.length;
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (length < 6) {
      setPasswordStrength('weak');
    } else if (length >= 6 && length < 10) {
      setPasswordStrength('medium');
    } else if (length >= 10 && (hasNumbers || hasSpecialChars)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [newPassword]);

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

  // Loading state while verifying token
  if (verifying) {
    return <Loading message="מאמת קישור..." />;
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background-primary flex">
        {/* Left Side - Branding (Hidden on mobile) */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-mesh"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-primary-800/30 to-transparent" />

          {/* Floating alert icons */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <AlertCircle className="w-8 h-8 text-red-400/30" />
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
              <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
              <h1 className="text-5xl font-display font-bold text-white mb-4">
                קישור לא תקין
              </h1>
              <p className="text-2xl text-gray-200 mb-6">
                נראה שהקישור פג תוקף
              </p>
              <p className="text-lg text-gray-300 max-w-md">
                קישורי איפוס סיסמה תקפים לשעה אחת בלבד מטעמי אבטחה
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Error State */}
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
              <p className="text-gray-400">קישור לא תקין</p>
            </div>

            {/* Error Card */}
            <motion.div
              className="bg-surface-primary border border-red-500/20 rounded-2xl shadow-2xl p-8"
              whileHover={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Error Icon */}
              <motion.div
                className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <AlertCircle className="w-10 h-10 text-red-400" />
              </motion.div>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-display font-bold text-gray-50 mb-2">
                  קישור לא תקין או פג תוקף
                </h2>
                <p className="text-gray-400">
                  קישור איפוס הסיסמה אינו תקין או שפג תוקפו (תקף לשעה אחת בלבד).
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate('/forgot-password')}
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                >
                  בקש קישור חדש
                </Button>

                <Link to="/login">
                  <Button variant="secondary" fullWidth>
                    חזרה להתחברות
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
  }

  // Success state after password reset
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background-primary flex">
        {/* Left Side - Branding (Hidden on mobile) */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-mesh"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-primary-800/30 to-transparent" />

          {/* Floating checkmarks */}
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
                  rotate: [0, 360],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-400/30" />
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
              <motion.div
                className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </motion.div>
              <h1 className="text-5xl font-display font-bold text-white mb-4">
                הסיסמה שונתה!
              </h1>
              <p className="text-2xl text-gray-200 mb-6">
                הכל מוכן להמשך
              </p>
              <p className="text-lg text-gray-300 max-w-md">
                הסיסמה שלך שונתה בהצלחה. כעת תוכל להתחבר עם הסיסמה החדשה
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Success State */}
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
              <p className="text-gray-400">הסיסמה אופסה בהצלחה</p>
            </div>

            {/* Success Card */}
            <motion.div
              className="bg-surface-primary border border-border-subtle rounded-2xl shadow-2xl p-8"
              whileHover={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Success Icon */}
              <motion.div
                className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </motion.div>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-display font-bold text-gray-50 mb-2">
                  הסיסמה שונתה בהצלחה!
                </h2>
                <p className="text-gray-400 mb-4">
                  כעת תוכל להתחבר עם הסיסמה החדשה שלך
                </p>
                <motion.p
                  className="text-sm text-gray-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  מעביר אותך להתחברות תוך 3 שניות...
                </motion.p>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/login')}
                leftIcon={<ArrowRight className="w-5 h-5 rotate-180" />}
              >
                התחבר עכשיו
              </Button>
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
  }

  // Reset password form
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
            <ShieldCheck className="w-20 h-20 text-gold-400 mx-auto mb-6" />
            <h1 className="text-6xl font-display font-bold text-white mb-4">
              סיסמה חדשה
            </h1>
            <p className="text-2xl text-gray-200 mb-6">
              צור סיסמה חזקה ומאובטחת
            </p>
            <p className="text-lg text-gray-300 max-w-md">
              בחר סיסמה חזקה כדי לשמור על החשבון שלך מאובטח
            </p>
          </motion.div>

          {/* Password Tips */}
          <motion.div
            className="mt-12 space-y-4 text-right"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: '🔐', text: 'לפחות 6 תווים' },
              { icon: '🔢', text: 'מומלץ להוסיף מספרים' },
              { icon: '✨', text: 'תווים מיוחדים מחזקים' },
              { icon: '🎯', text: 'עדיף סיסמה ארוכה' },
            ].map((tip, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 text-gray-200"
                variants={staggerItem}
              >
                <span className="text-2xl">{tip.icon}</span>
                <span className="text-lg">{tip.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Reset Form */}
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
            <p className="text-gray-400">צור סיסמה חדשה</p>
          </div>

          {/* Reset Card */}
          <motion.div
            className="bg-surface-primary border border-border-subtle rounded-2xl shadow-2xl p-8"
            whileHover={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.4)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-gray-50 mb-2">
                איפוס סיסמה
              </h2>
              <p className="text-gray-400">הזן את הסיסמה החדשה שלך</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Field */}
              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  label="סיסמה חדשה"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {confirmPassword && (
                  <motion.div
                    className="mt-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {newPassword === confirmPassword ? (
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
                leftIcon={<Key className="w-5 h-5" />}
              >
                {loading ? 'מעדכן סיסמה...' : 'עדכן סיסמה'}
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

            {/* Back to Login */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">זוכר את הסיסמה?</p>
              <Link to="/login">
                <Button variant="secondary" fullWidth>
                  חזרה להתחברות
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

export default ResetPasswordPage;
