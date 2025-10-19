import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { expensesApi, categoriesApi } from '../services/api';
import type { Expense, Category } from '../types';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import ExpenseCard from '../components/expenses/ExpenseCard';

function ExpensesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    } catch (error) {
      console.error('Error loading data:', error);
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
        price_per_unit: formData.price_per_unit,
        quantity: formData.quantity,
        amount_paid: formData.amount_paid.toString(),
      });

      // Reset form and reload
      setFormData({ name: '', price_per_unit: '', quantity: 1, amount_paid: 0 });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Header title={`הוצאות - ${category?.name || 'טוען...'}`} backTo="/categories" />

        {/* Add expense button */}
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => setShowForm(!showForm)}
            type="button"
          >
            {showForm ? '✕ ביטול' : 'הוסף הוצאה +'}
          </Button>
        </div>

        {/* Add expense form */}
        {showForm && (
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 mb-10 animate-[slideDown_0.3s_ease-out] transition-all duration-300 hover:shadow-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-purple-900 mb-6">הוסף הוצאה חדשה</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  שם ההוצאה *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    placeholder:text-gray-400
                  "
                  placeholder="למשל: DJ, צלם, פרחים..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  מחיר ליחידה *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
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
                    placeholder:text-gray-400
                  "
                  placeholder="0"
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
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
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
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  סכום ששולם
                </label>
                <input
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
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
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" variant="primary">
                ✓ שמור הוצאה
              </Button>
            </div>
          </form>
        )}

        {/* Expenses list */}
        {expenses.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">💸</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              אין הוצאות עדיין
            </h2>
            <p className="text-purple-100 text-lg">
              התחל על ידי הוספת ההוצאה הראשונה שלך למעלה!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesPage;