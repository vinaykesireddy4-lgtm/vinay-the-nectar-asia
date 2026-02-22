import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, 
  AlertCircle, FileText, Factory, Truck, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Total Invoices',
      value: stats?.total_invoices || 0,
      change: '+8.2%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Pending Amount',
      value: `₹${(stats?.pending_amount || 0).toLocaleString()}`,
      change: '-4.1%',
      trend: 'down',
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50'
    },
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      change: '+3.7%',
      trend: 'up',
      icon: Package,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    }
  ];

  const quickStats = [
    { label: 'Customers', value: stats?.total_customers || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Suppliers', value: stats?.total_suppliers || 0, icon: Truck, color: 'text-green-600' },
    { label: 'Production Orders', value: stats?.total_production_orders || 0, icon: Factory, color: 'text-purple-600' },
    { label: 'Purchase Orders', value: stats?.total_purchase_orders || 0, icon: ShoppingCart, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { type: 'Invoice', desc: 'New invoice created #INV-2024-001', time: '2 hours ago', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { type: 'Production', desc: 'Production order completed', time: '5 hours ago', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { type: 'Purchase', desc: 'Purchase order #PO-2024-015 pending', time: '1 day ago', icon: Clock, color: 'bg-orange-100 text-orange-600' },
    { type: 'Stock', desc: 'Low stock alert: Raw Material A', time: '2 days ago', icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.full_name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <img 
                src="/nectar-logo-new.png?v=2" 
                alt="Nectar" 
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                data-testid={`stat-card-${index}`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-6">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Title */}
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  
                  {/* Value */}
                  <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                  
                  {/* Trend */}
                  <div className={`flex items-center text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    {card.change} from last month
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-5 rounded-bl-full`}></div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-600" />
                  Quick Overview
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <Icon className={`h-8 w-8 ${stat.color} mb-3`} />
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Performance Chart Placeholder */}
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Revenue Trend
                  </h3>
                  <span className="text-xs text-gray-600">Last 7 days</span>
                </div>
                <div className="h-32 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 75, 90].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-200 cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activity.desc}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                View all activity →
              </button>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
            <FileText className="h-10 w-10 mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Create Invoice</h3>
            <p className="text-blue-100 text-sm mb-4 relative z-10">Generate new sales invoice</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors relative z-10">
              Get Started →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
            <ShoppingCart className="h-10 w-10 mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">New Purchase Order</h3>
            <p className="text-green-100 text-sm mb-4 relative z-10">Create purchase order</p>
            <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors relative z-10">
              Get Started →
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-bl-full"></div>
            <Factory className="h-10 w-10 mb-4 relative z-10" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Production Order</h3>
            <p className="text-purple-100 text-sm mb-4 relative z-10">Start new production</p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors relative z-10">
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
