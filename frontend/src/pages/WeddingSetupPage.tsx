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
  CheckCircle
} from 'lucide-react';
import { weddingApi } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  // Pre-fill data if wedding exists
  useEffect(() => {
    if (wedding) {
      setFormData({
        bride_name: wedding.bride_name || '',
        groom_name: wedding.groom_name || '',
        wedding_date: wedding.wedding_date ? new Date(wedding.wedding_date).toISOString().split('T')[0] : '',
        venue: wedding.venue || undefined,
        address: wedding.address || undefined,
        budget: wedding.budget || undefined,
      });
    }
  }, [wedding]);

  // Redirect only if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields
    if (!formData.bride_name.trim() || !formData.groom_name.trim() || !formData.wedding_date) {
      toast.error('נא למלא את כל השדות החובה');
      return;
    }

    try {
      setLoading(true);

      // Prepare data
      const weddingData: CreateWeddingDto = {
        bride_name: formData.bride_name.trim(),
        groom_name: formData.groom_name.trim(),
        wedding_date: formData.wedding_date,
        venue: formData.venue?.trim(),
        address: formData.address?.trim(),
        budget: formData.budget,
      };

      let response;
      if (wedding) {
        // Update existing wedding
        response = await weddingApi.update(weddingData);
        toast.success('פרטי החתונה עודכנו בהצלחה! ✨');
      } else {
        // Create new wedding
        response = await weddingApi.create(weddingData);
        toast.success('החתונה שלכם נוצרה בהצלחה! 🎉');
        navigate('/dashboard');
      }

      setWedding(response.data);

    } catch (error) {
      console.error('Wedding setup/update error:', error);
      toast.error('שגיאה בשמירת הפרטים');
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
    <div className="min-h-screen bg-background">
      {/* Decorative Background */}
      <div className="fixed inset-0 bg-background/50" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

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
            <Heart className="w-8 h-8 text-primary/30 fill-primary/20" />
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
                <Heart className="w-16 h-16 text-primary fill-primary mx-auto" />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4"
            >
              {wedding ? 'עדכון פרטי' : 'בואו נתחיל לתכנן את'}{' '}
              <span className="text-primary">החתונה</span>
              {wedding ? '' : ' שלכם!'}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              נשמח להכיר - ספרו לנו קצת על החתונה המיוחלת ✨
            </motion.p>
          </motion.div>

          {/* Setup Card */}
          <motion.div
            className="bg-card text-card-foreground border rounded-xl shadow-lg p-8 sm:p-10"
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
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">פרטי החתן והכלה</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bride Name */}
                    <div className="space-y-2">
                      <Label htmlFor="bride_name">
                        שם הכלה <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Heart className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="bride_name"
                          name="bride_name"
                          value={formData.bride_name}
                          onChange={handleInputChange}
                          className="pr-10"
                          placeholder="שם מלא"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Groom Name */}
                    <div className="space-y-2">
                      <Label htmlFor="groom_name">
                        שם החתן <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Heart className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="groom_name"
                          name="groom_name"
                          value={formData.groom_name}
                          onChange={handleInputChange}
                          className="pr-10"
                          placeholder="שם מלא"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Wedding Date */}
                <motion.div variants={staggerItem}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">תאריך החתונה</h3>
                    </div>
                    <Label htmlFor="wedding_date">
                      תאריך <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="wedding_date"
                        name="wedding_date"
                        value={formData.wedding_date}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Optional Fields Divider */}
                <motion.div
                  variants={staggerItem}
                  className="relative py-4"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-card text-muted-foreground text-sm">
                      שדות אופציונליים (ניתן למלא מאוחר יותר)
                    </span>
                  </div>
                </motion.div>

                {/* Venue & Location */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold">מקום וכתובת</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Venue */}
                    <div className="space-y-2">
                      <Label htmlFor="venue">
                        מקום האירוע <span className="text-muted-foreground text-xs font-normal">(אופציונלי)</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="venue"
                          name="venue"
                          value={formData.venue}
                          onChange={handleInputChange}
                          className="pr-10"
                          placeholder='לדוגמה: "אולמי דיאמונד"'
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        כתובת <span className="text-muted-foreground text-xs font-normal">(אופציונלי)</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="pr-10"
                          placeholder='לדוגמה: "רחוב הרצל 25, תל אביב"'
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Budget */}
                <motion.div variants={staggerItem}>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">תקציב</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">
                      תקציב משוער <span className="text-muted-foreground text-xs font-normal">(אופציונלי)</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget || ''}
                        onChange={handleInputChange}
                        className="pr-10"
                        placeholder="150000"
                        min="0"
                        step="1000"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">בשקלים - ניתן לעדכן בכל עת</p>
                  </div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                  variants={staggerItem}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">טיפ:</p>
                      <p className="text-muted-foreground">
                        אתם יכולים למלא רק את השדות החובה כרגע ולהוסיף את שאר הפרטים מאוחר יותר מדף החתונה
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={staggerItem} className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-5 h-5 ml-2 animate-spin" />
                        יוצר את החתונה...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        {wedding ? 'עדכן פרטים' : 'צרו את החתונה שלכם'}
                      </>
                    )}
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
            <p className="text-muted-foreground text-sm">
              <span className="text-destructive">*</span> שדות חובה
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeddingSetupPage;
