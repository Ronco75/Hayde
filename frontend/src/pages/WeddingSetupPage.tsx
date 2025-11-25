/**
 * WeddingSetupPage - Modern wedding setup onboarding page
 * Step-by-step form with animations and new Input components
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { weddingApi } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import type { CreateWeddingDto } from '../types';
import { slideUp, staggerContainer, staggerItem } from '../utils/motion';

const WeddingSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, wedding, setWedding } = useAuth();

  const [formData, setFormData] = useState<CreateWeddingDto>({
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    venue: '',
    address: '',
    budget: undefined,
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated or wedding already exists
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (wedding) {
        // Wedding already exists, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, wedding, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields
    if (!formData.bride_name.trim() || !formData.groom_name.trim() || !formData.wedding_date) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }

    try {
      setLoading(true);

      // Prepare data - remove empty optional fields
      const weddingData: CreateWeddingDto = {
        bride_name: formData.bride_name.trim(),
        groom_name: formData.groom_name.trim(),
        wedding_date: formData.wedding_date,
      };

      // Add optional fields only if they have values
      if (formData.venue?.trim()) {
        weddingData.venue = formData.venue.trim();
      }
      if (formData.address?.trim()) {
        weddingData.address = formData.address.trim();
      }
      if (formData.budget && formData.budget > 0) {
        weddingData.budget = formData.budget;
      }

      const response = await weddingApi.create(weddingData);
      setWedding(response.data);
      toast.success('החתונה שלכם נוצרה בהצלחה! 🎉');
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by axios interceptor
      console.error('Wedding setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return <Loading message="טוען..." />;
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Decorative Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-background-primary to-background-primary" />

      {/* Floating Hearts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
              rotate: [0, 10, -10, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Heart className="w-8 h-8 text-rose-400/30 fill-rose-400/20" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 py-12">
        <motion.div
          className="w-full max-w-3xl"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div
            className="text-center mb-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem} className="mb-6">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="inline-block"
              >
                <Heart className="w-16 h-16 text-rose-400 fill-rose-400 mx-auto" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl font-display font-bold text-white mb-4"
            >
              בואו נתחיל לתכנן את{' '}
              <span className="text-gradient-purple">החתונה</span>
              {' '}שלכם!
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              נשמח להכיר - ספרו לנו קצת על החתונה המיוחלת ✨
            </motion.p>
          </motion.div>

          {/* Setup Card */}
          <motion.div
            className="bg-surface-primary border border-border-subtle rounded-2xl shadow-2xl p-8 sm:p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit}>
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Names Section */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                    <h3 className="text-lg font-semibold text-white">פרטי החתן והכלה</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bride Name */}
                    <Input
                      type="text"
                      name="bride_name"
                      label={
                        <span>
                          שם הכלה <span className="text-rose-400">*</span>
                        </span>
                      }
                      value={formData.bride_name}
                      onChange={handleInputChange}
                      leftIcon={<Heart className="w-5 h-5 text-rose-400" />}
                      placeholder="שם מלא"
                      required
                      disabled={loading}
                      fullWidth
                    />

                    {/* Groom Name */}
                    <Input
                      type="text"
                      name="groom_name"
                      label={
                        <span>
                          שם החתן <span className="text-rose-400">*</span>
                        </span>
                      }
                      value={formData.groom_name}
                      onChange={handleInputChange}
                      leftIcon={<Heart className="w-5 h-5 text-blue-400" />}
                      placeholder="שם מלא"
                      required
                      disabled={loading}
                      fullWidth
                    />
                  </div>
                </motion.div>

                {/* Wedding Date */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">תאריך החתונה</h3>
                  </div>

                  <Input
                    type="date"
                    name="wedding_date"
                    label={
                      <span>
                        תאריך <span className="text-rose-400">*</span>
                      </span>
                    }
                    value={formData.wedding_date}
                    onChange={handleInputChange}
                    leftIcon={<Calendar className="w-5 h-5" />}
                    required
                    disabled={loading}
                    fullWidth
                  />
                </motion.div>

                {/* Optional Fields Divider */}
                <motion.div
                  variants={staggerItem}
                  className="relative py-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-subtle" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-surface-primary text-gray-400 text-sm">
                      שדות אופציונליים (ניתן למלא מאוחר יותר)
                    </span>
                  </div>
                </motion.div>

                {/* Venue & Location */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">מקום וכתובת</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Venue */}
                    <Input
                      type="text"
                      name="venue"
                      label={
                        <span>
                          מקום האירוע <span className="text-gray-500 text-xs">(אופציונלי)</span>
                        </span>
                      }
                      value={formData.venue}
                      onChange={handleInputChange}
                      leftIcon={<Building2 className="w-5 h-5" />}
                      placeholder='לדוגמה: "אולמי דיאמונד"'
                      disabled={loading}
                      fullWidth
                    />

                    {/* Address */}
                    <Input
                      type="text"
                      name="address"
                      label={
                        <span>
                          כתובת <span className="text-gray-500 text-xs">(אופציונלי)</span>
                        </span>
                      }
                      value={formData.address}
                      onChange={handleInputChange}
                      leftIcon={<MapPin className="w-5 h-5" />}
                      placeholder='לדוגמה: "רחוב הרצל 25, תל אביב"'
                      disabled={loading}
                      fullWidth
                    />
                  </div>
                </motion.div>

                {/* Budget */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-gold-400" />
                    <h3 className="text-lg font-semibold text-white">תקציב</h3>
                  </div>

                  <Input
                    type="number"
                    name="budget"
                    label={
                      <span>
                        תקציב משוער <span className="text-gray-500 text-xs">(אופציונלי)</span>
                      </span>
                    }
                    value={formData.budget || ''}
                    onChange={handleInputChange}
                    leftIcon={<DollarSign className="w-5 h-5" />}
                    placeholder="לדוגמה: 150000"
                    helperText="בשקלים - ניתן לעדכן בכל עת"
                    min="0"
                    step="1000"
                    disabled={loading}
                    fullWidth
                  />
                </motion.div>

                {/* Info Box */}
                <motion.div
                  variants={staggerItem}
                  className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-gray-200 mb-1">טיפ:</p>
                      <p>
                        אתם יכולים למלא רק את השדות החובה כרגע ולהוסיף את שאר הפרטים מאוחר יותר מדף החתונה
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={staggerItem} className="pt-4">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    loading={loading}
                    fullWidth
                    leftIcon={<Sparkles className="w-5 h-5" />}
                    className="text-lg"
                  >
                    {loading ? 'יוצר את החתונה שלכם...' : 'צרו את החתונה שלכם'}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </motion.div>

          {/* Required Fields Note */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-500 text-sm">
              <span className="text-rose-400">*</span> שדות חובה
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeddingSetupPage;
