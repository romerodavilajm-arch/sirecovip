import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Map,
  Store,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Definir menú según rol
  const menuItems = {
    inspector: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: Map, label: 'Mapa', path: '/app/map' },
      { icon: Store, label: 'Comerciantes', path: '/app/merchants' },
      { icon: FileText, label: 'Reportes', path: '/app/reports' },
    ],
    coordinator: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
      { icon: Map, label: 'Mapa General', path: '/app/map' },
      // { icon: Users, label: 'Inspectores', path: '/app/inspectores' }, // TODO: Implementar página
      { icon: Store, label: 'Comerciantes', path: '/app/merchants' },
      { icon: FileText, label: 'Reportes', path: '/app/reports' },
      // { icon: Settings, label: 'Configuración', path: '/app/configuracion' }, // TODO: Implementar página
    ],
  };

  const currentMenu = menuItems[user?.role] || menuItems.inspector;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
          }
        `}
      >
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo y Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">SIRECOVIP</h1>
            <p className="text-xs text-gray-500 mt-1">Sistema de Registro</p>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.assigned_zone || 'Sin zona asignada'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {currentMenu.map((item, index) => (
          <NavItem key={index} item={item} isMobile={isMobile} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar - Fija */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Sheet/Drawer */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-blue-600">SIRECOVIP</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
