import axios from 'axios';
import type { Category, Expense } from '../types';

const API_URL = 'http://localhost:3000/api';

export const categoriesApi = {
    getAll: () => axios.get<Category[]>(`${API_URL}/categories`),
    create: (name: string) => axios.post<Category>(`${API_URL}/categories`, { name }),
};

export const expensesApi = {
    getAll: () => axios.get<Expense[]>(`${API_URL}/expenses`),
    getByCategory: (categoryId: number) => 
      axios.get<Expense[]>(`${API_URL}/expenses/category/${categoryId}`),
    create: (expense: Omit<Expense, 'id' | 'created_at' | 'total_cost' | 'remaining_amount'>) => 
      axios.post<Expense>(`${API_URL}/expenses`, expense),
};