import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user.role === 'ADMIN' ? "/admin/dashboard" : "/dashboard"} className="text-xl font-bold">
          Complaint Redressal
        </Link>
        <div className="flex gap-4 items-center">
          <span>Welcome, {user.username}</span>
          {user.role !== 'ADMIN' && (
            <Link to="/lodge-complaint" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">
              New Complaint
            </Link>
          )}
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
