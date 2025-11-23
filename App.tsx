import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import PublicForm from './pages/PublicForm';
import Submissions from './pages/Submissions';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Layout or specific layout) */}
        <Route path="/form/:id" element={<PublicForm />} />
        
        {/* App Routes (With Navbar) */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        
        {/* Protected Routes (Logic handled inside components for this demo, usually handled by a Guard) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/builder/:id" element={<Layout><FormBuilder /></Layout>} />
        <Route path="/submissions/:id" element={<Layout><Submissions /></Layout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
