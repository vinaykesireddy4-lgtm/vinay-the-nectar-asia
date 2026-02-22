import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, Package, Users, FileText, Plus, List, TruckIcon, DollarSign, Settings, Box, PackageOpen, AlertCircle, FileSpreadsheet, ShoppingCart, Truck, Receipt, BarChart3, FileBarChart, UserCheck, Factory, Clipboard, PackageCheck, LayoutGrid, BookOpen, ClipboardCheck, PackagePlus, Calculator, Menu, X, LogOut, User, Briefcase, Calendar, UserPlus, CalendarCheck, IndianRupee, Star, Target, Building2, UserCog, Shield, Key, Smartphone, MessageCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Layout = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: Home },
      ]
    },
    {
      title: 'Inventory',
      items: [
        { name: 'Inventory Dashboard', path: '/inventory-dashboard', icon: LayoutGrid },
        { name: 'Inventory Overview', path: '/inventory-overview', icon: LayoutGrid },
        { name: 'Pending Approvals', path: '/pending-approvals', icon: ClipboardCheck },
        { name: 'Request Purchase', path: '/request-purchase', icon: ShoppingCart },
        { name: 'Stock Inward', path: '/stock-inward', icon: PackagePlus },
        { name: 'Finished Goods', path: '/products', icon: Package },
        { name: 'Raw Materials', path: '/raw-materials', icon: Box },
        { name: 'Packing Materials', path: '/packing-materials', icon: PackageOpen },
      ]
    },
    {
      title: 'Manufacturing',
      items: [
        { name: 'Manufacturing Dashboard', path: '/manufacturing-dashboard', icon: LayoutGrid },
        { name: 'BOM', path: '/bom', icon: Clipboard },
        { name: 'Production Orders', path: '/production-orders', icon: Factory },
      ]
    },
    {
      title: 'Sales',
      items: [
        { name: 'Sales Dashboard', path: '/sales-dashboard', icon: LayoutGrid },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Customer Ledger', path: '/customer-ledger', icon: UserCheck },
        { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet },
        { name: 'Sales Orders', path: '/sales-orders', icon: ShoppingCart },
        { name: 'Create Invoice', path: '/create-invoice', icon: Plus },
        { name: 'Invoices', path: '/invoices', icon: List },
        { name: 'Invoice Manager (WhatsApp)', path: '/invoice-manager', icon: MessageCircle },
        { name: 'Delivery Challan', path: '/delivery-challans', icon: Truck },
        { name: 'Credit Notes', path: '/credit-notes', icon: Receipt },
        { name: 'Journal Entries', path: '/journal-entries', icon: FileText },
      ]
    },
    {
      title: 'Purchase',
      items: [
        { name: 'Purchase Dashboard', path: '/purchase-dashboard', icon: LayoutGrid },
        { name: 'Suppliers', path: '/suppliers', icon: TruckIcon },
        { name: 'Purchase Requests', path: '/purchase-requests', icon: ClipboardCheck },
        { name: 'Supplier Comparison', path: '/supplier-comparison', icon: BarChart3 },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
        { name: 'Purchase Invoices', path: '/purchase-invoices', icon: FileText },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Finance Dashboard', path: '/finance-dashboard', icon: LayoutGrid },
        { name: 'Recovery', path: '/recovery', icon: TrendingUp },
        { name: 'Balance Sheet', path: '/balance-sheet', icon: Calculator },
        { name: 'Finance Approvals', path: '/finance-approvals', icon: ClipboardCheck },
        { name: 'Payment Received', path: '/payment-received', icon: DollarSign },
        { name: 'Payment Made', path: '/payment-made', icon: DollarSign },
        { name: 'Day Book', path: '/day-book', icon: BookOpen },
      ]
    },
    {
      title: 'Reports',
      items: [
        { name: 'Finished Stock', path: '/finished-stock', icon: PackageCheck },
        { name: 'Outstanding', path: '/outstanding-invoices', icon: AlertCircle },
        { name: 'Sales Report', path: '/sales-report', icon: BarChart3 },
        { name: 'Payment Summary', path: '/payment-summary', icon: FileBarChart },
      ]
    },
    {
      title: 'Human Resources',
      items: [
        { name: 'HR Dashboard', path: '/hr/dashboard', icon: LayoutGrid },
        { name: 'Employee Portal', path: '/employee-portal', icon: User },
        { name: 'Employees', path: '/hr/employees', icon: Users },
        { name: 'Departments', path: '/hr/departments', icon: Briefcase },
        { name: 'Attendance', path: '/hr/attendance/mark', icon: UserCheck },
        { name: 'Attendance Reports', path: '/hr/attendance/report', icon: CalendarCheck },
        { name: 'Leave Management', path: '/hr/leave', icon: Calendar },
        { name: 'Payroll', path: '/hr/payroll', icon: IndianRupee },
        { name: 'Performance', path: '/hr/performance', icon: Star },
        { name: 'Goals & KPIs', path: '/hr/goals', icon: Target },
        { name: 'Job Postings', path: '/hr/jobs', icon: Building2 },
        { name: 'Candidates', path: '/hr/candidates', icon: UserCog },
        { name: 'Interviews', path: '/hr/interviews', icon: CalendarCheck },
      ]
    },
    {
      title: 'Admin',
      items: [
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Role Management', path: '/admin/roles', icon: Shield },
      ]
    },
    {
      title: 'Settings',
      items: [
        { name: 'Company', path: '/company-settings', icon: Settings },
        { name: 'WhatsApp', path: '/settings/whatsapp', icon: Smartphone },
      ]
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on Print */}
      <aside className={cn(
        "bg-white shadow-lg border-r border-gray-200 overflow-y-auto print:hidden transition-all duration-300",
        sidebarOpen ? "w-64" : "w-0"
      )}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src="/nectar-logo.svg" 
              alt="Nectar Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nectar</h1>
              <p className="text-xs text-gray-500">takes care forever</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-indigo-100 rounded transition-colors"
                title="Logout"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors print:hidden"
          data-testid="sidebar-toggle"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;