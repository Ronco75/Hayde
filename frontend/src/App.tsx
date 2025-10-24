import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ExpensesPage from './pages/ExpensesPage';
import GroupsPage from './pages/GroupsPage';
import GuestsPage from './pages/GuestsPage';

function App() {
  return (
    <>
      {/* Toast notification container - displays all toast messages */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Specific options by type
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId/expenses" element={<ExpensesPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/guests" element={<GuestsPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;