import axios from 'axios';
import type { Category, Expense, CategoryTotals } from '../types';

const API_URL = 'http://localhost:3000/api';

export const categoriesApi = {
    getAll: () => axios.get<Category[]>(`${API_URL}/categories`),
    create: (name: string) => axios.post<Category>(`${API_URL}/categories`, { name }),
    update: (id: number, name: string) => axios.put<Category>(`${API_URL}/categories/${id}`, { name }),
    delete: (id: number) => axios.delete<void>(`${API_URL}/categories/${id}`),
};

export const expensesApi = {
    getAll: () => axios.get<Expense[]>(`${API_URL}/expenses`),

    getByCategory: (categoryId: number) => 
      axios.get<Expense[]>(`${API_URL}/expenses/category/${categoryId}`),

    getTotals: () => axios.get<CategoryTotals[]>(`${API_URL}/expenses/totals`),

    create: (expense: Omit<Expense, 'id' | 'created_at' | 'total_cost' | 'remaining_amount'>) => 
      axios.post<Expense>(`${API_URL}/expenses`, expense),

    update: (id: number, expense: Omit<Expense, 'id' | 'created_at' | 'total_cost' | 'remaining_amount'>) => 
      axios.put<Expense>(`${API_URL}/expenses/${id}`, expense),

    delete: (id: number) => 
      axios.delete<void>(`${API_URL}/expenses/${id}`),

};