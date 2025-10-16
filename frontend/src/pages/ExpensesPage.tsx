import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expensesApi, categoriesApi } from '../services/api';
import type { Expense, Category } from '../types';

function ExpensesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="text-white hover:text-purple-200 transition"
          >
            ← חזרה לקטגוריות
          </button>
          <h1 className="text-4xl font-bold text-white">
            הוצאות - {category?.name || 'טוען...'}
          </h1>
        </div>

        {/* Add expense button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition mb-6"
        >
          {showForm ? 'ביטול' : '+ הוסף הוצאה'}
        </button>

        {/* Add expense form */}
        {showForm && (
          <form onSubmit={handleCreateExpense} className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם ההוצאה
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="למשל: DJ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מחיר ליחידה
                </label>
                <input
                  type="number"
                  required
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כמות
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סכום ששולם
                </label>
                <input
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              שמור הוצאה
            </button>
          </form>
        )}

        {/* Expenses list */}
        {expenses.length === 0 ? (
          <div className="text-center text-white text-lg mt-8">
            אין הוצאות עדיין. הוסף את הראשונה! 💸
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-right">שם</th>
                  <th className="px-6 py-3 text-right">מחיר ליחידה</th>
                  <th className="px-6 py-3 text-right">כמות</th>
                  <th className="px-6 py-3 text-right">סה"כ עלות</th>
                  <th className="px-6 py-3 text-right">שולם</th>
                  <th className="px-6 py-3 text-right">נשאר לתשלום</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-purple-50">
                    <td className="px-6 py-4 font-medium">{expense.name}</td>
                    <td className="px-6 py-4">₪{parseFloat(expense.price_per_unit).toFixed(2)}</td>
                    <td className="px-6 py-4">{expense.quantity}</td>
                    <td className="px-6 py-4 font-bold text-purple-900">
                      ₪{parseFloat(expense.total_cost).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      ₪{parseFloat(expense.amount_paid).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-bold">
                      ₪{parseFloat(expense.remaining_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesPage;