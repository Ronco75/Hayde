import { useEffect, useState } from 'react';
import { categoriesApi, expensesApi } from '../services/api';
import type { Category, CategoryTotals } from '../types';
import { formatNis } from '../utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '../components/common/Modal'; // Keeping legacy Modal for now or should I make a Dialog? Let's use legacy modal but style content
import {
  Plus,
  Wallet,
  CheckCircle,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Pencil,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalsByCategoryId, setTotalsByCategoryId] = useState<Record<number, CategoryTotals>>({});
  const [overallTotals, setOverallTotals] = useState({ total_cost: 0, amount_paid: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
        const total = parseFloat(row.total_cost || '0');
        const paid = parseFloat(row.amount_paid || '0');
        sum.total_cost += total;
        sum.amount_paid += paid;
      });
      sum.remaining = sum.total_cost - sum.amount_paid;

      setTotalsByCategoryId(totalsMap);
      setOverallTotals(sum);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('שגיאה בטעינת נתונים');
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
      loadCategories();
      toast.success('קטגוריה נוצרה בהצלחה');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('שגיאה ביצירת קטגוריה');
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setShowEditModal(true);
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit || !editName.trim()) return;

    try {
      await categoriesApi.update(categoryToEdit.id, editName);
      setShowEditModal(false);
      setCategoryToEdit(null);
      loadCategories();
      toast.success('הקטגוריה עודכנה');
    } catch (error) {
      toast.error('שגיאה בעדכון הקטגוריה');
    }
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesApi.delete(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadCategories();
      toast.success('הקטגוריה נמחקה');
    } catch (error) {
      toast.error('שגיאה במחיקת הקטגוריה');
    }
  };

  if (loading) {
    return <div className="p-8">טוען קטגוריות...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ניהול הוצאות</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="ml-2 h-4 w-4" />
          הוסף קטגוריה
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">תקציב כולל</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatNis(overallTotals.total_cost)}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">שולם</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNis(overallTotals.amount_paid)}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">נותר לתשלום</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatNis(overallTotals.remaining)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const stats = totalsByCategoryId[category.id] || { total_cost: '0', amount_paid: '0', remaining_amount: '0' };
          const total = parseFloat(stats.total_cost || '0');
          const paid = parseFloat(stats.amount_paid || '0');
          const progress = total > 0 ? (paid / total) * 100 : 0;

          return (
            <Card key={category.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">תקציב</span>
                    <span className="font-medium">{formatNis(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">שולם</span>
                    <span className="font-medium text-green-600">{formatNis(paid)}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Link to={`/categories/${category.id}/expenses`} className="w-full">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    לפרטים והוספת הוצאות
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}

        {/* Add New Category Card (Empty State-ish) */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed rounded-xl border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all group"
        >
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="font-medium text-muted-foreground group-hover:text-foreground">הוסף קטגוריה חדשה</span>
        </button>
      </div>

      {/* Modals - Keeping them simple for now */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="הוסף קטגוריה חדשה">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם הקטגוריה</label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="למשל: צילום, בר, אולם"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>ביטול</Button>
            <Button type="submit">שמור</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="ערוך קטגוריה">
        <form onSubmit={handleConfirmEdit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם הקטגוריה</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>ביטול</Button>
            <Button type="submit">שמור שינויים</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="מחיקת קטגוריה">
        <div className="space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p>האם אתה בטוח שברצונך למחוק את הקטגוריה <strong>{categoryToDelete?.name}</strong>?</p>
          <p className="text-sm text-muted-foreground">פעולה זו לא ניתנת לביטול.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>ביטול</Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>מחק קטגוריה</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CategoriesPage;
