import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';
import type { Category } from '../types';
import Loading from '../components/common/Loading';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/common/Button';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await categoriesApi.create(newCategoryName);
      setNewCategoryName('');
      loadCategories(); // Reload the list
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-10 text-center">
          קטגוריות הוצאות
        </h1>

        {/* Form to add new category */}
        <form
          onSubmit={handleCreateCategory}
          className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 mb-10 transition-all duration-300 hover:shadow-purple-500/20"
        >
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            הוסף קטגוריה חדשה
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="למשל: אולם, צלם, קייטרינג..."
              className="
                flex-1
                px-4
                py-3
                text-base
                border-2
                border-gray-300
                rounded-lg
                focus:outline-none
                focus:ring-4
                focus:ring-purple-300
                focus:border-purple-600
                transition-all
                duration-200
                placeholder:text-gray-400
              "
            />
            <Button type="submit">
              הוסף קטגוריה +
            </Button>
          </div>
        </form>

        {/* Categories list */}
        {categories.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              אין קטגוריות עדיין
            </h2>
            <p className="text-purple-100 text-lg">
              התחל על ידי הוספת הקטגוריה הראשונה שלך למעלה!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;