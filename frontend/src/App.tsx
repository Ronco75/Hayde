import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CategoriesPage from './pages/CategoriesPage';
import ExpensesPage from './pages/ExpensesPage';
import GroupsPage from './pages/GroupsPage';
import GuestsPage from './pages/GuestsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId/expenses" element={<ExpensesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/guests" element={<GuestsPage />} />
      </Routes>
    </Router>
  );
}

export default App;