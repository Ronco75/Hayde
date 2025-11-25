/**
 * HomePage - Modern landing page with hero section, features, and CTA
 * Fully animated with Framer Motion and responsive design
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Heart,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { staggerContainer, staggerItem } from '../utils/motion';

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
    return <Loading message="טוען..." />;
  }

  const features = [
    {
      icon: DollarSign,
      title: 'ניהול תקציב חכם',
      description: 'עקבו אחר כל ההוצאות והתקציב במקום אחד. תראו בזמן אמת כמה הוצאתם וכמה נשאר.',
      color: 'from-emerald-500 to-emerald-700',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: Users,
      title: 'ניהול מוזמנים',
      description: 'נהלו את רשימת המוזמנים, עקבו אחר אישורי הגעה ושלחו תזכורות בקלות.',
      color: 'from-blue-500 to-blue-700',
      glow: 'shadow-blue-500/20',
    },
    {
      icon: BarChart3,
      title: 'דוחות וסטטיסטיקות',
      description: 'צפו בגרפים מפורטים ונתונים סטטיסטיים על התקציב, האורחים והתקדמות התכנון.',
      color: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/20',
    },
    {
      icon: Calendar,
      title: 'תכנון מסודר',
      description: 'ארגנו את כל המידע והמשימות במקום אחד. הכל נגיש, פשוט וברור.',
      color: 'from-rose-500 to-rose-700',
      glow: 'shadow-rose-500/20',
    },
  ];

  const benefits = [
    'חיסכון בזמן ובכסף',
    'ממשק פשוט ואינטואיטיבי',
    'נגיש מכל מקום',
    'עדכונים בזמן אמת',
    'תמיכה מלאה בעברית',
    'חינם לשימוש',
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-background-primary to-background-primary" />

        {/* Floating Hearts Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <Heart className={`w-${4 + Math.floor(Math.random() * 8)} h-${4 + Math.floor(Math.random() * 8)} text-rose-400/20`} />
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:py-32 lg:py-40">
          <motion.div
            className="text-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Logo */}
            <motion.div variants={staggerItem} className="mb-8">
              <motion.div
                className="inline-flex items-center gap-3 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Sparkles className="w-12 h-12 text-gold-400" />
                <h1 className="text-7xl sm:text-8xl font-display font-bold text-gradient-purple">
                  Hayde
                </h1>
                <Sparkles className="w-12 h-12 text-gold-400" />
              </motion.div>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              variants={staggerItem}
              className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
            >
              תכנון החתונה{' '}
              <span className="text-gradient-purple">המושלמת</span>
              {' '}שלכם
            </motion.h2>

            {/* Subheading */}
            <motion.p
              variants={staggerItem}
              className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              נהלו את כל פרטי החתונה במקום אחד - תקציב, אורחים, הוצאות ועוד.
              <br />
              פשוט, יעיל, ומותאם במיוחד לחתונות בישראל
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <Button
                  variant="gold"
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  className="text-lg px-8"
                >
                  התחילו בחינם עכשיו
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<ArrowRight className="w-5 h-5 rotate-180" />}
                  className="text-lg px-8"
                >
                  כניסה למערכת
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={staggerItem}
              className="mt-12 flex items-center justify-center gap-2 text-gray-400"
            >
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 border-2 border-background-primary flex items-center justify-center"
                  >
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm">
                מאות זוגות כבר מתכננים את החתונה שלהם איתנו
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24 fill-surface-primary">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-surface-primary py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
              כל מה שאתם צריכים
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              כלים חכמים ופשוטים שיעזרו לכם לתכנן את החתונה המושלמת
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className={`
                    bg-surface-secondary
                    border border-border-subtle
                    rounded-2xl
                    p-6
                    h-full
                    shadow-xl
                    hover:shadow-2xl
                    hover:border-primary-500/30
                    transition-all
                    duration-300
                    ${feature.glow}
                  `}>
                    {/* Icon */}
                    <motion.div
                      className={`
                        w-14 h-14
                        bg-gradient-to-br ${feature.color}
                        rounded-xl
                        flex items-center justify-center
                        mb-4
                        shadow-lg
                      `}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h4 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative bg-background-primary py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Benefits List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
                למה לבחור ב-Hayde?
              </h3>
              <p className="text-xl text-gray-400 mb-8">
                הכלי המושלם לניהול חתונה - חכם, פשוט ויעיל
              </p>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="flex items-center gap-3 text-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Decorative Element */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative bg-gradient-mesh rounded-2xl p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-transparent" />

                {/* Floating Elements */}
                <div className="relative z-10 space-y-6">
                  {[
                    { icon: Heart, color: 'text-rose-400', label: 'אהבה' },
                    { icon: Sparkles, color: 'text-gold-400', label: 'חגיגה' },
                    { icon: CheckCircle, color: 'text-emerald-400', label: 'הצלחה' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        className="flex items-center gap-4 bg-surface-primary/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Icon className={`w-8 h-8 ${item.color}`} />
                        <span className="text-xl font-semibold text-white">{item.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-primary-900/20 via-surface-primary to-background-primary py-20 border-t border-border-subtle">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <Heart className="w-16 h-16 text-rose-400 fill-rose-400" />
          </motion.div>

          <h3 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            מוכנים להתחיל?
          </h3>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            הצטרפו עכשיו והתחילו לתכנן את החתונה המושלמת שלכם בקלות.
            ההרשמה חינמית לחלוטין!
          </p>

          <Link to="/register">
            <Button
              variant="gold"
              size="lg"
              leftIcon={<Sparkles className="w-5 h-5" />}
              className="text-xl px-10 py-4 h-auto"
            >
              יצירת חשבון בחינם
            </Button>
          </Link>

          <p className="text-sm text-gray-500 mt-6">
            אין צורך בכרטיס אשראי • מתחילים תוך דקות
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-background-primary border-t border-border-subtle py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold-400" />
              <span className="text-xl font-display font-bold text-gradient-purple">
                Hayde
              </span>
            </div>

            <p className="text-gray-500 text-sm text-center">
              &copy; 2025 Hayde - תכנון חתונות חכם ופשוט
            </p>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                התחברות
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/register" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                הרשמה
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
