import { useEffect, useState } from 'react';
import { categoriesApi, expensesApi } from '../services/api';
import type { Category, CategoryTotals } from '../types';
import Loading from '../components/common/Loading';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalsByCategoryId, setTotalsByCategoryId] = useState<Record<number, CategoryTotals>>({});

  // Fetch categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [categoriesResponse, totalsResponse] = await Promise.all([
        categoriesApi.getAll(),
        expensesApi.getTotals(),
      ]);
      setCategories(categoriesResponse.data);
      const totalsMap: Record<number, CategoryTotals> = {};
      totalsResponse.data.forEach((row) => {
        totalsMap[row.category_id] = row;
      });
      setTotalsByCategoryId(totalsMap);
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

  // Category modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setShowEditModal(true);
  };

  const handleDelete = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId) || null;
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;
    const name = editName.trim();
    if (!name) return;
    try {
      await categoriesApi.update(categoryToEdit.id, name);
      setShowEditModal(false);
      setCategoryToEdit(null);
      setEditName('');
      await loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesApi.delete(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <>
    <div className="min-h-screen bg-slate-950 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 mb-10 text-center">
          קטגוריות הוצאות
        </h1>

        {/* Form to add new category */}
        <form
          onSubmit={handleCreateCategory}
          className="bg-slate-900 border border-white/10 rounded-xl shadow-elev-2 p-6 sm:p-8 mb-10"
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
                flex-1 px-4 py-3 text-base rounded-lg
                bg-slate-800 text-gray-100 placeholder:text-gray-400
                border border-white/10 focus:outline-none focus:ring-4
                focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
              "
            />
            <Button type="submit">
              הוסף קטגוריה +
            </Button>
          </div>
        </form>

        {/* Categories list */}
        {categories.length === 0 ? (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              אין קטגוריות עדיין
            </h2>
            <p className="text-gray-400 text-lg">
              התחל על ידי הוספת הקטגוריה הראשונה שלך למעלה!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                totals={totalsByCategoryId[category.id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Category Delete Confirmation Modal */}
    <Modal 
      isOpen={showDeleteModal} 
      onClose={() => setShowDeleteModal(false)}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">🗑️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">מחיקת קטגוריה</h2>
        <p className="text-gray-600 mb-8">
          האם אתה בטוח שברצונך למחוק את הקטגוריה
          {categoryToDelete ? ` "${categoryToDelete.name}" ` : ' '}?
          <br />
          <span className="font-semibold">לא ניתן לשחזר את הפעולה הזו.</span>
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" type="button" onClick={() => setShowDeleteModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" type="button" onClick={handleConfirmDelete}>
            מחק
          </Button>
        </div>
      </div>
    </Modal>

    {/* Category Edit Modal */}
    <Modal 
      isOpen={showEditModal} 
      onClose={() => setShowEditModal(false)}
    >
      <div>
        <h2 className="text-2xl font-bold text-purple-900 mb-6">עריכת קטגוריה</h2>
        <form onSubmit={handleConfirmEdit}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            שם הקטגוריה
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            className="
              w-full
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
            "
            placeholder="שם חדש"
          />
          <div className="flex gap-4 mt-6 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
              ביטול
            </Button>
            <Button type="submit">
              שמור
            </Button>
          </div>
        </form>
      </div>
    </Modal>
    </>
  );
}

export default CategoriesPage;