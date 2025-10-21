import axios from 'axios';
import type { 
  Category, 
  Expense, 
  CategoryTotals,
  Group,
  Guest,
  GuestStats,
  CreateGroupDto,
  UpdateGroupDto,
  CreateGuestDto,
  UpdateGuestDto,
  UpdateRsvpDto
} from '../types';

const API_URL = 'http://localhost:3000/api';

// ============= CATEGORIES API =============
export const categoriesApi = {
    getAll: () => axios.get<Category[]>(`${API_URL}/categories`),
    create: (name: string) => axios.post<Category>(`${API_URL}/categories`, { name }),
    update: (id: number, name: string) => axios.put<Category>(`${API_URL}/categories/${id}`, { name }),
    delete: (id: number) => axios.delete<void>(`${API_URL}/categories/${id}`),
};

// ============= EXPENSES API =============
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

// ============= GROUPS API =============
export const groupsApi = {
    // Get all groups
    getAll: () => 
      axios.get<Group[]>(`${API_URL}/groups`),

    // Create a new group
    create: (data: CreateGroupDto) => 
      axios.post<Group>(`${API_URL}/groups`, data),

    // Update a group
    update: (id: number, data: UpdateGroupDto) => 
      axios.put<Group>(`${API_URL}/groups/${id}`, data),

    // Delete a group
    delete: (id: number) => 
      axios.delete<void>(`${API_URL}/groups/${id}`),
};

// ============= GUESTS API =============
export const guestsApi = {
    // Get all guests
    getAll: () => 
      axios.get<Guest[]>(`${API_URL}/guests`),

    // Get a single guest by ID
    getById: (id: number) => 
      axios.get<Guest>(`${API_URL}/guests/${id}`),

    // Get guests by group
    getByGroup: (groupId: number) => 
      axios.get<Guest[]>(`${API_URL}/guests/group/${groupId}`),

    // Get guest statistics
    getStats: () => 
      axios.get<GuestStats>(`${API_URL}/guests/stats`),

    // Create a new guest
    create: (data: CreateGuestDto) => 
      axios.post<Guest>(`${API_URL}/guests`, data),

    // Update a guest (full update)
    update: (id: number, data: UpdateGuestDto) => 
      axios.put<Guest>(`${API_URL}/guests/${id}`, data),

    // Update only RSVP status
    updateRsvp: (id: number, data: UpdateRsvpDto) => 
      axios.patch<Guest>(`${API_URL}/guests/${id}/rsvp`, data),

    // Mark invitation as sent
    markInvitationSent: (id: number) => 
      axios.patch<Guest>(`${API_URL}/guests/${id}/invitation`),

    // Mark reminder as sent
    markReminderSent: (id: number) => 
      axios.patch<Guest>(`${API_URL}/guests/${id}/reminder`),

    // Delete a guest
    delete: (id: number) => 
      axios.delete<void>(`${API_URL}/guests/${id}`),
};