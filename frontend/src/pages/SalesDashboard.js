import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, ShoppingCart, Receipt, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_customers: 0,
    total_quotations: 0,
    pending_quotations: 0,
    total_sales_orders: 0,
    pending_invoices: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/sales/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Customers', value: stats.total_customers, icon: Users, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Total Quotations', value: stats.total_quotations, icon: FileText, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { title: 'Pending Quotations', value: stats.pending_quotations, icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { title: 'Sales Orders', value: stats.total_sales_orders, icon: ShoppingCart, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Pending Invoices', value: stats.pending_invoices, icon: Receipt, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { title: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-500', textColor: 'text-indigo-600' }
  ];

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/customers')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">View Customers</h3>
            <p className="text-sm text-gray-600">Manage customer database</p>
          </button>
          <button onClick={() => navigate('/quotations')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <FileText className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Quotations</h3>
            <p className="text-sm text-gray-600">Create & manage quotes</p>
          </button>
          <button onClick={() => navigate('/invoices')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <Receipt className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600">View all invoices</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

import { Clock } from 'lucide-react';
export default SalesDashboard;