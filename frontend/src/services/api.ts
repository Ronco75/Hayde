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
  UpdateGiftAmountDto,
  BulkDeleteGuestsDto,
  BulkUpdateRsvpDto,
  BulkUpdateGroupDto,
  BulkOperationResponse,
  CreateExpenseDto,
  UpdateExpenseDto,
  ImportPreviewResponse,
  ImportConfirmRequest,
  ImportConfirmResponse,
  User,
  Wedding,
  LoginDto,
  RegisterDto,
  AuthResponse,
  CreateWeddingDto,
  UpdateWeddingDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyTokenResponse,
  ImageUploadResponse,
  Table,
  TableWithAssignments,
  UnassignedGuest,
  SeatingOverview,
  CreateTableDto,
  UpdateTableDto,
  UpdateTablePositionDto,
  AssignGuestDto,
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
 * Axios request interceptor to attach JWT token
 * Automatically adds Authorization header to all requests if token exists
 */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

      case 401: // Unauthorized - invalid or expired token
        toast.error('אנא התחבר מחדש למערכת');
        // Clear invalid token
        localStorage.removeItem('authToken');
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
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

      case 429: // Too Many Requests (rate limiting)
        toast.error(data.error || 'יותר מדי ניסיונות - נסה שוב מאוחר יותר');
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

    // Update gift amount (only for confirmed guests)
    updateGiftAmount: (id: number, data: UpdateGiftAmountDto) =>
      axios.patch<Guest>(`${API_URL}/guests/${id}/gift`, data),

    // Mark invitation as sent
    markInvitationSent: (id: number) => 
      axios.patch<Guest>(`${API_URL}/guests/${id}/invitation`),

    // Mark reminder as sent
    markReminderSent: (id: number) => 
      axios.patch<Guest>(`${API_URL}/guests/${id}/reminder`),

    // Delete a guest
    delete: (id: number) => 
      axios.delete<void>(`${API_URL}/guests/${id}`),

    // Bulk delete guests
    bulkDelete: (data: BulkDeleteGuestsDto) =>
      axios.delete<BulkOperationResponse>(`${API_URL}/guests/bulk`, { data }),

    // Bulk update RSVP status
    bulkUpdateRsvp: (data: BulkUpdateRsvpDto) =>
      axios.patch<BulkOperationResponse>(`${API_URL}/guests/bulk/rsvp`, data),

    // Bulk update group
    bulkUpdateGroup: (data: BulkUpdateGroupDto) =>
      axios.patch<BulkOperationResponse>(`${API_URL}/guests/bulk/group`, data),
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

// ============= AUTHENTICATION API =============
export const authApi = {
  // Login with email and password
  login: (credentials: LoginDto) =>
    axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials),

  // Register new user
  register: (credentials: RegisterDto) =>
    axios.post<AuthResponse>(`${API_URL}/auth/register`, credentials),

  // Get current user data
  getCurrentUser: () =>
    axios.get<User>(`${API_URL}/auth/me`),

  // Logout (optional - mainly handled client-side)
  logout: () =>
    axios.post<void>(`${API_URL}/auth/logout`),

  // Request password reset email
  forgotPassword: (data: ForgotPasswordDto) =>
    axios.post<{ message: string }>(`${API_URL}/auth/forgot-password`, data),

  // Reset password with token
  resetPassword: (data: ResetPasswordDto) =>
    axios.post<{ message: string }>(`${API_URL}/auth/reset-password`, data),

  // Verify if reset token is valid
  verifyResetToken: (token: string) =>
    axios.get<VerifyTokenResponse>(`${API_URL}/auth/verify-reset-token/${token}`),
};

// ============= WEDDING API =============
export const weddingApi = {
  // Create a new wedding
  create: (data: CreateWeddingDto) =>
    axios.post<Wedding>(`${API_URL}/weddings`, data),

  // Get user's wedding
  get: () =>
    axios.get<Wedding>(`${API_URL}/weddings`),

  // Update wedding details
  update: (data: UpdateWeddingDto) =>
    axios.put<Wedding>(`${API_URL}/weddings`, data),

  // Delete wedding
  delete: () =>
    axios.delete<void>(`${API_URL}/weddings`),

  // Upload invitation image
  uploadInvitationImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post<ImageUploadResponse>(
      `${API_URL}/weddings/invitation-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Delete invitation image
  deleteInvitationImage: () =>
    axios.delete<{ message: string; wedding: Wedding }>(`${API_URL}/weddings/invitation-image`),
};

// ============= TABLES API (Seating) =============
export const tablesApi = {
  // Get all tables with assignments
  getAll: () =>
    axios.get<TableWithAssignments[]>(`${API_URL}/tables`),

  // Get a single table by ID
  getById: (id: number) =>
    axios.get<TableWithAssignments>(`${API_URL}/tables/${id}`),

  // Create a new table
  create: (data: CreateTableDto) =>
    axios.post<Table>(`${API_URL}/tables`, data),

  // Update a table
  update: (id: number, data: UpdateTableDto) =>
    axios.put<TableWithAssignments>(`${API_URL}/tables/${id}`, data),

  // Update table position (for drag operations)
  updatePosition: (id: number, data: UpdateTablePositionDto) =>
    axios.patch<{ success: boolean }>(`${API_URL}/tables/${id}/position`, data),

  // Delete a table
  delete: (id: number) =>
    axios.delete<void>(`${API_URL}/tables/${id}`),

  // Assign a guest to a table
  assignGuest: (tableId: number, data: AssignGuestDto) =>
    axios.post<TableWithAssignments>(`${API_URL}/tables/${tableId}/assign`, data),

  // Unassign a guest from a table
  unassignGuest: (tableId: number, guestId: number) =>
    axios.delete<void>(`${API_URL}/tables/${tableId}/assign/${guestId}`),

  // Get unassigned confirmed guests
  getUnassignedGuests: () =>
    axios.get<UnassignedGuest[]>(`${API_URL}/tables/unassigned-guests`),

  // Get seating overview stats
  getOverview: () =>
    axios.get<SeatingOverview>(`${API_URL}/tables/overview`),
};