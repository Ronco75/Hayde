/**
 * ForgotPasswordPage - Modern split-screen password reset page
 * Matches LoginPage and RegisterPage design with animated success state
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Mail, CheckCircle, Clock, Key, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';

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

  // Success State - Email Sent
  if (emailSent) {
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

          {/* Floating checkmarks animation */}
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
                  rotate: [0, 5, -5, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
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
              <div className="mb-8">
                <motion.div
                  className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <Mail className="w-12 h-12 text-emerald-400" />
                </motion.div>
              </div>
              <h1 className="text-5xl font-display font-bold text-white mb-4">
                בדוק את המייל
              </h1>
              <p className="text-2xl text-gray-200 mb-6">
                המייל כבר בדרך אליך
              </p>
              <p className="text-lg text-gray-300 max-w-md">
                שלחנו הוראות לאיפוס סיסמה לכתובת המייל שהזנת
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
              <p className="text-gray-400">בדוק את המייל שלך</p>
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
                  מייל נשלח!
                </h2>
                <p className="text-gray-400 mb-2">
                  אם המייל קיים במערכת, נשלח אליו קישור לאיפוס:
                </p>
                <p className="text-primary-400 font-semibold mt-2">
                  {email}
                </p>
              </div>

              {/* Instructions Card */}
              <motion.div
                className="bg-surface-secondary border border-border-subtle rounded-xl p-5 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300 text-right flex-1">
                    <p className="font-semibold text-gray-200 mb-2">שים לב:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span>הקישור תקף ל-60 דקות בלבד</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span>בדוק גם את תיקיית הספאם/דואר זבל</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span>
                        <span>המייל עשוי להגיע תוך מספר דקות</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="primary"
                  fullWidth
                  leftIcon={<Mail className="w-5 h-5" />}
                >
                  שלח מייל מחדש
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

  // Form State - Enter Email
  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-mesh"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-primary-800/30 to-transparent" />

        {/* Floating keys animation */}
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
              <Key className="w-8 h-8 text-primary-400/30" />
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
              <ShieldCheck className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            </div>
            <h1 className="text-6xl font-display font-bold text-white mb-4">
              איפוס סיסמה
            </h1>
            <p className="text-2xl text-gray-200 mb-6">
              תוך רגע תקבל קישור לאיפוס
            </p>
            <p className="text-lg text-gray-300 max-w-md">
              נשלח לך מייל עם קישור מאובטח לאיפוס הסיסמה שלך
            </p>
          </motion.div>

          {/* Security Features */}
          <motion.div
            className="mt-12 space-y-4 text-right"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: '🔒', text: 'קישור מאובטח' },
              { icon: '⏱️', text: 'תקף ל-60 דקות' },
              { icon: '✉️', text: 'נשלח למייל שלך' },
              { icon: '🔐', text: 'בטוח ומוצפן' },
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
            <p className="text-gray-400">איפוס סיסמה</p>
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
                שכחת סיסמה?
              </h2>
              <p className="text-gray-400">אין בעיה! נשלח לך קישור לאיפוס</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <Input
                type="email"
                name="email"
                label="כתובת מייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                placeholder="example@email.com"
                required
                disabled={loading}
                fullWidth
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
                className="mt-8"
                leftIcon={<Key className="w-5 h-5" />}
              >
                {loading ? 'שולח...' : 'שלח קישור לאיפוס סיסמה'}
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
              <p className="text-gray-400 text-sm mb-3">נזכרת בסיסמה?</p>
              <Link to="/login">
                <Button variant="secondary" fullWidth>
                  חזרה להתחברות
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Register Link */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-400 text-sm mb-2">
              עדיין אין לך חשבון?
            </p>
            <Link to="/register">
              <Button variant="ghost" size="sm">
                הירשם עכשיו
              </Button>
            </Link>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
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

export default ForgotPasswordPage;
