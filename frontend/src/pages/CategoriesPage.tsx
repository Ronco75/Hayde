/**
 * CategoriesPage - Modern categories management page
 * Grid layout with FAB-style add button and animated cards
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { categoriesApi, expensesApi } from '../services/api';
import type { Category, CategoryTotals } from '../types';
import { formatNis } from '../utils/format';
import { slideUp, staggerContainer, staggerItem, fadeIn } from '../utils/motion';
import Loading from '../components/common/Loading';
import Header from '../components/common/Header';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import {
  Plus,
  Wallet,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalsByCategoryId, setTotalsByCategoryId] = useState<Record<number, CategoryTotals>>({});
  const [overallTotals, setOverallTotals] = useState({ total_cost: 0, amount_paid: 0, remaining: 0 });
  const [showAddModal, setShowAddModal] = useState(false);

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
      let sum = { total_cost: 0, amount_paid: 0, remaining: 0 };
      totalsResponse.data.forEach((row) => {
        totalsMap[row.category_id] = row;
        const total = parseFloat(row.total_cost);
        const paid = parseFloat(row.amount_paid);
        sum.total_cost += isNaN(total) ? 0 : total;
        sum.amount_paid += isNaN(paid) ? 0 : paid;
      });
      sum.remaining = sum.total_cost - sum.amount_paid;
      setTotalsByCategoryId(totalsMap);
      setOverallTotals(sum);
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
      setShowAddModal(false);
      loadCategories(); // Reload the list
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('שגיאה ביצירת הקטגוריה, אנא נסה שנית.');
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
    const category = categories.find((c) => c.id === categoryId) || null;
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

  if (loading) {
    return <Loading />;
  }

  const paidPercentage =
    overallTotals.total_cost > 0
      ? ((overallTotals.amount_paid / overallTotals.total_cost) * 100).toFixed(0)
      : '0';

  return (
    <>
      <div className="min-h-screen bg-background-primary">
        {/* Decorative Background */}
        <div className="fixed inset-0 bg-gradient-mesh opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-gold-900/10 via-background-primary to-background-primary" />

        {/* Content */}
        <div className="relative z-10">
          <Header title="הוצאות" />

          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            {/* Overall Totals Summary */}
            <motion.div
              className="bg-surface-primary border border-border-subtle rounded-2xl shadow-xl p-6 mb-8"
              variants={fadeIn}
            >
              <h2 className="text-xl font-display font-bold text-gray-50 mb-6 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-gold-400" />
                סיכום כולל
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Cost */}
                <motion.div
                  className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-5"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">סה"כ עלות</span>
                    <Wallet className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="text-primary-400 font-numeric font-bold text-3xl">
                    {formatNis(overallTotals.total_cost)}
                  </div>
                </motion.div>

                {/* Amount Paid */}
                <motion.div
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-400 text-sm font-medium">שולם</span>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-emerald-400 font-numeric font-bold text-3xl">
                    {formatNis(overallTotals.amount_paid)}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    {paidPercentage}% מהתקציב
                  </div>
                </motion.div>

                {/* Remaining */}
                <motion.div
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-rose-400 text-sm font-medium">נשאר לתשלום</span>
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="text-rose-400 font-numeric font-bold text-3xl">
                    {formatNis(overallTotals.remaining)}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Categories Grid */}
            {categories.length === 0 ? (
              <motion.div variants={fadeIn}>
                <EmptyState
                  icon={FolderOpen}
                  title="אין קטגוריות עדיין"
                  description="התחל על ידי הוספת הקטגוריה הראשונה שלך"
                  action={
                    <Button
                      variant="gold"
                      size="lg"
                      onClick={() => setShowAddModal(true)}
                      leftIcon={<Plus className="w-5 h-5" />}
                    >
                      הוסף קטגוריה ראשונה
                    </Button>
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {categories.map((category) => (
                  <motion.div key={category.id} variants={staggerItem}>
                    <CategoryCard
                      category={category}
                      totals={totalsByCategoryId[category.id]}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Floating Action Button (FAB) */}
        {categories.length > 0 && (
          <motion.div
            className="fixed bottom-8 left-8 z-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <motion.button
              onClick={() => setShowAddModal(true)}
              className="
                w-16 h-16
                bg-gradient-to-br from-gold-500 to-gold-600
                text-white
                rounded-full
                shadow-glow-gold
                hover:shadow-2xl
                flex items-center justify-center
                focus:outline-none focus:ring-4 focus:ring-gold-500/50
                transition-all duration-200
              "
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-8 h-8" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCategoryName('');
        }}
        title="הוסף קטגוריה חדשה"
      >
        <form onSubmit={handleCreateCategory} className="space-y-6">
          <Input
            type="text"
            name="category_name"
            label="שם הקטגוריה"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            leftIcon={<FolderOpen className="w-5 h-5" />}
            placeholder="למשל: אולם, צלם, קייטרינג..."
            required
            fullWidth
            autoFocus
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setNewCategoryName('');
              }}
            >
              ביטול
            </Button>
            <Button
              variant="gold"
              type="submit"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              הוסף קטגוריה
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCategoryToEdit(null);
          setEditName('');
        }}
        title="עריכת קטגוריה"
      >
        <form onSubmit={handleConfirmEdit} className="space-y-6">
          <Input
            type="text"
            name="category_name"
            label="שם הקטגוריה"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            leftIcon={<FolderOpen className="w-5 h-5" />}
            placeholder="שם חדש"
            required
            fullWidth
            autoFocus
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setCategoryToEdit(null);
                setEditName('');
              }}
            >
              ביטול
            </Button>
            <Button variant="primary" type="submit">
              שמור
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        title="מחיקת קטגוריה"
      >
        <div className="text-center space-y-6">
          <motion.div
            className="mx-auto w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <AlertCircle className="w-10 h-10 text-rose-400" />
          </motion.div>

          <div>
            <p className="text-gray-300 mb-2">
              האם אתה בטוח שברצונך למחוק את הקטגוריה
            </p>
            {categoryToDelete && (
              <p className="text-primary-400 font-display font-semibold text-xl">
                "{categoryToDelete.name}"
              </p>
            )}
            <p className="text-rose-400 font-semibold text-sm mt-4">
              לא ניתן לשחזר את הפעולה הזו.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setCategoryToDelete(null);
              }}
            >
              ביטול
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              מחק
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CategoriesPage;
