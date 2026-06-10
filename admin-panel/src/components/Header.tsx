
import { Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'User Management',
  '/listings': 'Listings',
  '/notifications': 'Notifications',
  '/announcements': 'Announcements',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Admin Panel';
  const [adminName, setAdminName] = useState(localStorage.getItem('mx_admin_name') || 'Waqar');

  useEffect(() => {
    const handleUpdate = () => setAdminName(localStorage.getItem('mx_admin_name') || 'Waqar');
    window.addEventListener('admin_updated', handleUpdate);
    return () => window.removeEventListener('admin_updated', handleUpdate);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile - clicks to Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{adminName}</p>
          </div>
        </button>
      </div>
    </header>
  );
};
