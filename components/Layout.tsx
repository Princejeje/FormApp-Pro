import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react';
import { getSession, mockLogout } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await mockLogout();
    navigate('/login');
  };

  // Don't show nav on public form view if not logged in (or just to keep it clean)
  const isPublicForm = location.pathname.startsWith('/form/');

  if (isPublicForm && !session) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={session ? "/dashboard" : "/"} className="flex items-center gap-2">
                <div className="bg-primary text-white p-1.5 rounded-lg">
                  <LayoutDashboard size={20} />
                </div>
                <span className="font-bold text-xl text-slate-800">FormApp<span className="text-primary">Pro</span></span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition">Dashboard</Link>
                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                    <span className="text-sm text-slate-500 flex items-center gap-2">
                      <User size={16} />
                      {session.user.name}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="text-slate-500 hover:text-red-600 transition"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium">Login</Link>
                  <Link to="/register" className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {session ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-slate-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50">Login</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-50">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FormApp Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;