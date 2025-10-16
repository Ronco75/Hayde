import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';
import type { Category } from '../types';
import { useNavigate } from 'react-router-dom';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">קטגוריות הוצאות</h1>

        {/* Form to add new category */}
        <form onSubmit={handleCreateCategory} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="הוסף קטגוריה"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              הוסף קטגוריה
            </button>
          </div>
        </form>

        {/* Categories list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/categories/${category.id}/expenses`)}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
            >
              <h2 className="text-2xl font-bold text-purple-900">{category.name}</h2>
              <p className="text-gray-500 text-sm mt-2">צפייה בהוצאות</p>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center text-white text-lg mt-8">
            אין קטגוריות עדיין. הוסף את הראשונה! 🎉
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;