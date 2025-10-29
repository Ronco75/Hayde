import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { expensesApi, categoriesApi } from '../services/api';
import type { Expense, Category } from '../types';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import ExpenseCard from '../components/expenses/ExpenseCard';
import Modal from '../components/common/Modal';
import Tooltip from '../components/common/Tooltip';
import { formatNis } from '../utils/format';
import toast from 'react-hot-toast';

function ExpensesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [totals, setTotals] = useState({ total_cost: 0, amount_paid: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  // Form state for creating new expense
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price_per_unit: '',
    quantity: 1,
    amount_paid: 0,
  });

  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price_per_unit: '',
    quantity: 1,
    amount_paid: 0,
  });

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    if (!categoryId) return;

    try {
      // Load category details
      const categoriesResponse = await categoriesApi.getAll();
      const foundCategory = categoriesResponse.data.find(
        (cat) => cat.id === parseInt(categoryId)
      );
      setCategory(foundCategory || null);

      // Load expenses for this category
      const expensesResponse = await expensesApi.getByCategory(parseInt(categoryId));
      setExpenses(expensesResponse.data);

      // Compute totals for this category
      const totalsComputed = expensesResponse.data.reduce(
        (acc, exp) => {
          const total = parseFloat(exp.total_cost || '0');
          const paid = parseFloat(exp.amount_paid || '0');
          return {
            total_cost: acc.total_cost + total,
            amount_paid: acc.amount_paid + paid,
            remaining: acc.remaining + (total - paid),
          };
        },
        { total_cost: 0, amount_paid: 0, remaining: 0 }
      );
      setTotals(totalsComputed);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('שגיאה בטעינת הדף, אנא נסה שנית.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

    try {
      await expensesApi.create({
        category_id: parseInt(categoryId),
        name: formData.name,
        price_per_unit: parseFloat(formData.price_per_unit as string) || 0,
        quantity: formData.quantity,
        amount_paid: formData.amount_paid,
      });

      // Reset form and reload
      setFormData({ name: '', price_per_unit: '', quantity: 1, amount_paid: 0 });
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error('Error creating expense:', err);
      toast.error('שגיאה ביצירת ההוצאה, אנא נסה שנית.');
    }
  };

  // Handle delete button click
  const handleDeleteClick = (expenseId: number) => {
    setExpenseToDelete(expenseId);
    setShowDeleteModal(true);
  };

    // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      await expensesApi.delete(expenseToDelete);
      
      // Update state by filtering out the deleted expense
      setExpenses(expenses.filter(exp => exp.id !== expenseToDelete));
      
      // Close modal and reset
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('שגיאה במחיקת ההוצאה, אנא נסה שנית.');
    }
  };

  // Handle edit button click
  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setEditFormData({
      name: expense.name,
      price_per_unit: expense.price_per_unit,
      quantity: expense.quantity,
      amount_paid: parseFloat(expense.amount_paid),
    });
    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseToEdit || !categoryId) return;

    try {
      const response = await expensesApi.update(expenseToEdit.id, {
        category_id: parseInt(categoryId),
        name: editFormData.name,
        price_per_unit: parseFloat(editFormData.price_per_unit as string) || 0,
        quantity: editFormData.quantity,
        amount_paid: editFormData.amount_paid,
      });

      // Update state with the updated expense
      setExpenses(expenses.map(exp => 
        exp.id === expenseToEdit.id ? response.data : exp
      ));

      // Close modal and reset
      setShowEditModal(false);
      setExpenseToEdit(null);
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('שגיאה בעדכון ההוצאה, אנא נסה שנית.');
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-7">
      <div className="max-w-6xl mx-auto">
        <Header title={`הוצאות - ${category?.name || 'טוען...'}`} />

        {/* Totals summary */}
        <div className="bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg shadow-elev-2 p-6 sm:p-7 mb-8 sm:mb-7">
          <h2 className="text-xl sm:text-lg font-bold text-primary-200 mb-4 sm:mb-3">סיכום קטגוריה</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
            <div className="bg-slate-800/70 border border-white/10 rounded-md p-4 sm:p-3">
              <div className="text-gray-300 text-sm sm:text-xs">סה"כ עלות</div>
              <div className="text-primary-300 font-extrabold text-2xl sm:text-xl">{formatNis(totals.total_cost)}</div>
            </div>
            <div className="bg-green-500/10 border border-white/10 rounded-md p-4 sm:p-3">
              <div className="text-green-400 text-sm sm:text-xs">שולם</div>
              <div className="text-green-300 font-extrabold text-2xl sm:text-xl">{formatNis(totals.amount_paid)}</div>
            </div>
            <div className="bg-rose-500/10 border border-white/10 rounded-md p-4 sm:p-3">
              <div className="text-rose-400 text-sm sm:text-xs">נשאר לתשלום</div>
              <div className="text-rose-300 font-extrabold text-2xl sm:text-xl">{formatNis(totals.remaining)}</div>
            </div>
          </div>
        </div>

        {/* Add expense button */}
        <div className="mb-8 sm:mb-7">
          <Button
            variant="secondary"
            onClick={() => setShowForm(!showForm)}
            type="button"
          >
            {showForm ? '✕ סגור טופס' : '+ הוסף הוצאה חדשה'}
          </Button>
        </div>

        {/* Create expense form */}
        {showForm && (
          <form
            onSubmit={handleCreateExpense}
            className="bg-slate-900 border border-white/10 rounded-xl sm:rounded-lg shadow-elev-2 p-6 sm:p-7 mb-10 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-xl font-bold text-primary-200 mb-6 sm:mb-5">הוצאה חדשה</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שם ההוצאה
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="
                    w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5 rounded-lg sm:rounded-md
                    bg-slate-800 text-gray-100 placeholder:text-gray-400
                    border border-white/10 focus:outline-none focus:ring-4
                    focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                  "
                  placeholder="למשל: DJ, תאורה, הגברה"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  מחיר ליחידה
                </label>
                <input
                  type="number"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  required
                  className="
                    w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5 rounded-lg sm:rounded-md
                    bg-slate-800 text-gray-100 placeholder:text-gray-400
                    border border-white/10 focus:outline-none focus:ring-4
                    focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                  "
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  כמות
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="
                    w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5 rounded-lg sm:rounded-md
                    bg-slate-800 text-gray-100 placeholder:text-gray-400
                    border border-white/10 focus:outline-none focus:ring-4
                    focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                  "
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  סכום ששולם
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                    className="
                      w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5 rounded-lg sm:rounded-md
                      bg-slate-800 text-gray-100 placeholder:text-gray-400
                      border border-white/10 focus:outline-none focus:ring-4
                      focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                    "
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <Tooltip content="מילוי אוטומטי לסכום הכולל">
                    <button
                      type="button"
                      onClick={() => {
                        const price = parseFloat(formData.price_per_unit as string);
                        const qty = Number(formData.quantity) || 0;
                        const total = (isNaN(price) ? 0 : price) * qty;
                        setFormData({ ...formData, amount_paid: Math.max(0, total) });
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-sm transition-colors"
                    >
                      שולם
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" variant="primary">
                 שמור הוצאה ✓
              </Button>
            </div>
          </form>
        )}

        {/* Expenses list */}
        {expenses.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-12 text-center">
            <div className="text-6xl sm:text-5xl mb-4">💸</div>
            <h2 className="text-2xl sm:text-xl font-bold text-white mb-2 leading-tight">
              אין הוצאות עדיין
            </h2>
            <p className="text-purple-100 text-lg sm:text-base">
              התחל על ידי הוספת ההוצאה הראשונה שלך למעלה!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 md:gap-5">
            {expenses.map((expense) => (
              <ExpenseCard 
                key={expense.id} 
                expense={expense}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="text-center">
            <div className="text-6xl sm:text-5xl mb-4">🗑️</div>
            <h2 className="text-2xl sm:text-xl font-bold text-gray-900 mb-4 leading-tight">
              מחיקת הוצאה
            </h2>
            <p className="text-gray-600 mb-8 text-base sm:text-sm">
              האם אתה בטוח שברצונך למחוק הוצאה זו?
              <br />
              <span className="font-semibold">לא ניתן לשחזר את הפעולה הזו.</span>
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="
                  px-6 py-3 sm:px-5 sm:py-2.5
                  bg-gray-200 
                  hover:bg-gray-300 
                  text-gray-800 
                  font-semibold text-sm sm:text-xs
                  rounded-lg sm:rounded-md
                  transition-all
                "
              >
                ביטול
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="
                  px-6 py-3 sm:px-5 sm:py-2.5
                  bg-red-600 
                  hover:bg-red-700 
                  text-white 
                  font-semibold text-sm sm:text-xs
                  rounded-lg sm:rounded-md
                  transition-all
                "
              >
                מחק
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)}
        >
          <div>
            <h2 className="text-2xl sm:text-xl font-bold text-purple-900 mb-6 sm:mb-5">עריכת הוצאה</h2>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 sm:space-y-3.5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    שם ההוצאה
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    className="
                      w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5
                      rounded-lg sm:rounded-md
                      bg-slate-800 text-gray-100 placeholder:text-gray-400
                      border border-white/10 focus:outline-none focus:ring-4
                      focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    מחיר ליחידה
                  </label>
                  <input
                    type="number"
                    value={editFormData.price_per_unit}
                    onChange={(e) => setEditFormData({ ...editFormData, price_per_unit: e.target.value })}
                    required
                    className="
                      w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5
                      rounded-lg sm:rounded-md
                      bg-slate-800 text-gray-100 placeholder:text-gray-400
                      border border-white/10 focus:outline-none focus:ring-4
                      focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                    "
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    כמות
                  </label>
                  <input
                    type="number"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 1 })}
                    className="
                      w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5
                      rounded-lg sm:rounded-md
                      bg-slate-800 text-gray-100 placeholder:text-gray-400
                      border border-white/10 focus:outline-none focus:ring-4
                      focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                    "
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    סכום ששולם
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={editFormData.amount_paid}
                      onChange={(e) => setEditFormData({ ...editFormData, amount_paid: parseFloat(e.target.value) || 0 })}
                      className="
                        w-full px-4 py-3 text-base sm:text-sm sm:px-3 sm:py-2.5
                        rounded-lg sm:rounded-md
                        bg-slate-800 text-gray-100 placeholder:text-gray-400
                        border border-white/10 focus:outline-none focus:ring-4
                        focus:ring-primary-300 focus:border-primary-600 transition-all duration-200
                      "
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                    <Tooltip content="מילוי אוטומטי לסכום הכולל">
                      <button
                        type="button"
                        onClick={() => {
                          if (expenseToEdit) {
                            const total = parseFloat(expenseToEdit.total_cost || '0');
                            setEditFormData({ ...editFormData, amount_paid: isNaN(total) ? 0 : total });
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-sm transition-colors"
                      >
                        שולם
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-3 mt-6 sm:mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="
                    flex-1 px-6 py-3 sm:px-5 sm:py-2.5
                    bg-gray-200 
                    hover:bg-gray-300 
                    text-gray-800 
                    font-semibold text-sm sm:text-xs
                    rounded-lg sm:rounded-md
                    transition-all
                  "
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="
                    flex-1 px-6 py-3 sm:px-5 sm:py-2.5
                    bg-purple-600 
                    hover:bg-purple-700 
                    text-white 
                    font-semibold text-sm sm:text-xs
                    rounded-lg sm:rounded-md
                    transition-all
                  "
                >
                  שמור שינויים
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ExpensesPage;