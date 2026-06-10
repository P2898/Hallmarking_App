
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  List, 
  Bell, 
  Tags, 
  BarChart2, 
  Settings, 
  LogOut,
  Menu,
  ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/authStore';

// Utility for tailwind classes
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Listings', path: '/listings', icon: List },
  { name: 'Reports', path: '/reports', icon: ShieldAlert },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const [adminName, setAdminName] = useState(localStorage.getItem('mx_admin_name') || 'Waqar');

  useEffect(() => {
    const handleUpdate = () => setAdminName(localStorage.getItem('mx_admin_name') || 'Waqar');
    window.addEventListener('admin_updated', handleUpdate);
    return () => window.removeEventListener('admin_updated', handleUpdate);
  }, []);
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-30 w-64 bg-dark text-white transform transition-transform duration-200 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        !isOpen && "md:w-20" // Collapsed state for desktop
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className={cn("w-full flex items-center gap-3", !isOpen && "md:hidden")}>
              <div className="w-8 h-8 rounded-full overflow-hidden items-center justify-center flex-shrink-0 bg-white">
                <img src="/logo_circle.png" alt="MX" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl text-gold">MachineXchange</span>
            </div>
            {(!isOpen && (
              <div className="hidden md:flex w-8 h-8 rounded overflow-hidden items-center justify-center flex-shrink-0 bg-white">
                <img src="/logo_circle.png" alt="MX" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Admin Info */}
        <div className={cn("p-4 border-b border-gray-800", !isOpen && "md:hidden")}>
          <p className="font-medium">{adminName}</p>
          <p className="text-sm text-gray-400">Super Administrator</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-gold text-dark font-medium" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  title={item.name}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className={cn("whitespace-nowrap", !isOpen && "md:hidden")}>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => useAuthStore.getState().logout()}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={cn("whitespace-nowrap", !isOpen && "md:hidden")}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
