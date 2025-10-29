import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
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
  UpdateRsvpDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ImportPreviewResponse,
  ImportConfirmRequest,
  ImportConfirmResponse
} from '../types';

const API_URL = 'http://localhost:3000/api';

/**
 * Error response interface from backend
 */
interface ApiErrorResponse {
  error: string;
  details?: Record<string, string>;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Axios response interceptor for error handling
 * Transforms backend errors into user-friendly toast notifications
 */
axios.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      toast.error('שגיאת רשת - לא ניתן להתחבר לשרת');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle different HTTP status codes with user-friendly messages
    switch (status) {
      case 400: // Validation errors
        if (data.details) {
          // Show validation errors for specific fields
          Object.entries(data.details).forEach(([field, message]) => {
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(data.error || 'שגיאת קלט - נתונים לא תקינים');
        }
        break;

      case 404: // Not found
        toast.error(data.error || 'המשאב המבוקש לא נמצא');
        break;

      case 409: // Conflict (e.g., duplicate, foreign key violation)
        toast.error(data.error || 'קיימת התנגשות עם נתונים קיימים');
        break;

      case 422: // Unprocessable entity
        toast.error(data.error || 'לא ניתן לבצע את הפעולה');
        break;

      case 500: // Server error
        toast.error(data.error || 'שגיאת שרת - נסה שוב מאוחר יותר');
        break;

      default:
        toast.error('אירעה שגיאה - נסה שוב');
    }

    return Promise.reject(error);
  }
);

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

    create: (expense: CreateExpenseDto) => 
      axios.post<Expense>(`${API_URL}/expenses`, expense),

    update: (id: number, expense: UpdateExpenseDto) => 
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

// ============= IMPORT API =============
export const importApi = {
  // Upload and preview Excel file
  preview: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post<ImportPreviewResponse>(
      `${API_URL}/import/preview`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Confirm and execute the import
  confirm: (data: ImportConfirmRequest) => 
    axios.post<ImportConfirmResponse>(`${API_URL}/import/confirm`, data),
};