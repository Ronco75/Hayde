import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CategoriesPage from './pages/CategoriesPage';
import ExpensesPage from './pages/ExpensesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/categories" replace />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId/expenses" element={<ExpensesPage />} />
      </Routes>
    </Router>
  );
}

export default App;