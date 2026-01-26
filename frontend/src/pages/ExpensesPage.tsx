import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { expensesApi, categoriesApi } from '../services/api';
import type { Expense, Category } from '../types';
import { formatNis } from '../utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ArrowRight,
  Plus,
  Trash2,
  Pencil,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal'; // Legacy modal for now

function ExpensesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // New Expense Form
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    price_per_unit: '',
    quantity: 1,
    amount_paid: ''
  });

  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (categoryId) loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      const [catRes, expRes] = await Promise.all([
        categoriesApi.getAll(), // TODO: Get single category API would be better
        expensesApi.getByCategory(parseInt(categoryId!))
      ]);

      const foundCat = catRes.data.find((c) => c.id === parseInt(categoryId!));
      setCategory(foundCat || null);
      setExpenses(expRes.data);
    } catch (err) {
      console.error(err);
      toast.error('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !categoryId) return;

    try {
      await expensesApi.create({
        category_id: parseInt(categoryId),
        name: newExpense.name,
        price_per_unit: parseFloat(newExpense.price_per_unit) || 0,
        quantity: newExpense.quantity,
        amount_paid: parseFloat(newExpense.amount_paid) || 0,
      });

      setNewExpense({ name: '', price_per_unit: '', quantity: 1, amount_paid: '' });
      setIsAdding(false);
      loadData();
      toast.success('הוצאה נוספה בהצלחה');
    } catch (error) {
      toast.error('שגיאה בהוספת הוצאה');
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      name: expense.name,
      price_per_unit: expense.price_per_unit,
      quantity: expense.quantity,
      amount_paid: expense.amount_paid
    });
  };

  const saveEdit = async () => {
    if (!editingId || !categoryId) return;
    try {
      await expensesApi.update(editingId, {
        category_id: parseInt(categoryId),
        name: editForm.name,
        price_per_unit: parseFloat(editForm.price_per_unit) || 0,
        quantity: parseInt(editForm.quantity) || 1,
        amount_paid: parseFloat(editForm.amount_paid) || 0
      });
      setEditingId(null);
      loadData();
      toast.success('הוצאה עודכנה');
    } catch (error) {
      toast.error('שגיאה בעדכון');
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await expensesApi.delete(expenseToDelete);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      setExpenses(prev => prev.filter(e => e.id !== expenseToDelete));
      toast.success('הוצאה נמחקה');
    } catch (error) {
      toast.error('שגיאה במחיקה');
    }
  };

  if (loading) return <div className="p-8">טוען...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/categories">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {category?.name || 'הוצאות'}
            </h1>
            <p className="text-muted-foreground">
              ניהול ההוצאות עבור קטגוריה זו
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'ביטול' : (
            <>
              <Plus className="ml-2 h-4 w-4" />
              הוסף הוצאה
            </>
          )}
        </Button>
      </div>

      {/* Add New Expense Form */}
      {isAdding && (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-lg">הוספת הוצאה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubmit} className="grid gap-4 md:grid-cols-5 items-end">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">שם ההוצאה</label>
                <Input
                  value={newExpense.name}
                  onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                  placeholder="למשל: מקדמה לצלם"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">מחיר ליחידה</label>
                <Input
                  type="number"
                  value={newExpense.price_per_unit}
                  onChange={e => setNewExpense({ ...newExpense, price_per_unit: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">כמות</label>
                <Input
                  type="number"
                  value={newExpense.quantity}
                  onChange={e => setNewExpense({ ...newExpense, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">שולם</label>
                <Input
                  type="number"
                  value={newExpense.amount_paid}
                  onChange={e => setNewExpense({ ...newExpense, amount_paid: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-5 flex justify-end mt-4">
                <Button type="submit">שמור הוצאה</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">שם ההוצאה</TableHead>
              <TableHead>מחיר ליחידה</TableHead>
              <TableHead>כמות</TableHead>
              <TableHead>סה"כ</TableHead>
              <TableHead>שולם</TableHead>
              <TableHead>יתרה</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                  אין הוצאות בקטגוריה זו עדיין.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => {
                const isEditing = editingId === expense.id;
                const total = parseFloat(expense.total_cost || '0');
                const paid = parseFloat(expense.amount_paid || '0');
                const remaining = total - paid;

                if (isEditing) {
                  return (
                    <TableRow key={expense.id} className="bg-muted/50">
                      <TableCell>
                        <Input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.price_per_unit}
                          onChange={e => setEditForm({ ...editForm, price_per_unit: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.quantity}
                          onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-muted-foreground">
                        -
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={editForm.amount_paid}
                          onChange={e => setEditForm({ ...editForm, amount_paid: e.target.value })}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={saveEdit}>
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={expense.id} className="group">
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell>{formatNis(parseFloat(expense.price_per_unit))}</TableCell>
                    <TableCell>{expense.quantity}</TableCell>
                    <TableCell className="font-bold">{formatNis(total)}</TableCell>
                    <TableCell className="text-green-600">{formatNis(paid)}</TableCell>
                    <TableCell className={remaining > 0 ? "text-red-500" : "text-green-500"}>
                      {formatNis(remaining)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                          setExpenseToDelete(expense.id);
                          setShowDeleteModal(true);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="מחיקת הוצאה">
        <div className="space-y-4 text-center">
          <p>האם אתה בטוח שברצונך למחוק הוצאה זו?</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>ביטול</Button>
            <Button variant="destructive" onClick={handleDelete}>מחק</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ExpensesPage;