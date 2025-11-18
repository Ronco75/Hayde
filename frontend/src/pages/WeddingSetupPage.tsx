import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { weddingApi } from '../services/api';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import type { CreateWeddingDto } from '../types';

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
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-gray-300 text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-3">
            בואו נתחיל לתכנן את החתונה שלכם! 💜
          </h1>
          <p className="text-gray-400 text-lg">
            נשמח להכיר - ספרו לנו קצת על החתונה המיוחלת
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-3 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bride Name - Required */}
              <div>
                <label
                  htmlFor="bride_name"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  שם הכלה <span className="text-primary-400">*</span>
                </label>
                <input
                  type="text"
                  id="bride_name"
                  name="bride_name"
                  value={formData.bride_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                           placeholder:text-gray-400 border border-white/10
                           focus:outline-none focus:ring-4 focus:ring-primary-300
                           focus:border-primary-600 transition-all duration-200"
                  placeholder="שם מלא"
                  required
                  disabled={loading}
                />
              </div>

              {/* Groom Name - Required */}
              <div>
                <label
                  htmlFor="groom_name"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  שם החתן <span className="text-primary-400">*</span>
                </label>
                <input
                  type="text"
                  id="groom_name"
                  name="groom_name"
                  value={formData.groom_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                           placeholder:text-gray-400 border border-white/10
                           focus:outline-none focus:ring-4 focus:ring-primary-300
                           focus:border-primary-600 transition-all duration-200"
                  placeholder="שם מלא"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Wedding Date - Required */}
            <div>
              <label
                htmlFor="wedding_date"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                תאריך החתונה <span className="text-primary-400">*</span>
              </label>
              <input
                type="date"
                id="wedding_date"
                name="wedding_date"
                value={formData.wedding_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Optional Fields Divider */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-gray-400 text-sm mb-4">
                השדות הבאים אופציונליים - ניתן להוסיף אותם מאוחר יותר
              </p>
            </div>

            {/* Venue - Optional */}
            <div>
              <label
                htmlFor="venue"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                מקום האירוע <span className="text-gray-500 text-xs">(אופציונלי)</span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                placeholder='לדוגמה: "אולמי דיאמונד"'
                disabled={loading}
              />
            </div>

            {/* Address - Optional */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                כתובת <span className="text-gray-500 text-xs">(אופציונלי)</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                placeholder='לדוגמה: "רחוב הרצל 25, תל אביב"'
                disabled={loading}
              />
            </div>

            {/* Budget - Optional */}
            <div>
              <label
                htmlFor="budget"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                תקציב משוער <span className="text-gray-500 text-xs">(אופציונלי)</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget || ''}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800 text-gray-100
                         placeholder:text-gray-400 border border-white/10
                         focus:outline-none focus:ring-4 focus:ring-primary-300
                         focus:border-primary-600 transition-all duration-200"
                placeholder="לדוגמה: 150000"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">בשקלים</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-8"
              disabled={loading}
            >
              {loading ? 'יוצר את החתונה שלכם...' : 'צרו את החתונה שלכם'}
            </Button>
          </form>
        </div>

        {/* Required Fields Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            <span className="text-primary-400">*</span> שדות חובה
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeddingSetupPage;
