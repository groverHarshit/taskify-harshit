import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckSquare, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

interface SidebarProps {
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {isMobile && (
        <div className="fixed top-0 left-0 z-40 w-full h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 font-bold text-lg text-gray-800">Taskify</div>
        </div>
      )}

      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              } transition-transform duration-300 ease-in-out`
            : 'relative'
        } ${isOpen ? 'w-64' : 'w-20'} h-full bg-white border-r border-gray-200 flex flex-col`}
      >
        {isMobile && (
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
        )}

        <div className={`flex items-center ${isOpen ? 'justify-start px-6' : 'justify-center'} py-6`}>
          {isOpen ? (
            <div className="text-xl font-bold text-blue-600">Taskify</div>
          ) : (
            <div className="text-blue-600">
              <CheckSquare size={28} />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="mt-8 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-3 px-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {isOpen && <span className="ml-3">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className={`flex ${isOpen ? 'items-start' : 'justify-center'} mb-4`}>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <User size={20} />
              </div>
              {isOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 ${isOpen ? '' : 'justify-center'}`}
          >
            <LogOut size={20} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;