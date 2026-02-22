import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Receipt, FileText, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    accounts_receivable: 0,
    accounts_payable: 0,
    total_revenue: 0,
    total_expenses: 0,
    profit: 0,
    pending_invoices: 0,
    pending_bills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/finance/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Accounts Receivable', value: `₹${stats.accounts_receivable.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Accounts Payable', value: `₹${stats.accounts_payable.toLocaleString()}`, icon: TrendingDown, color: 'bg-red-500', textColor: 'text-red-600' },
    { title: 'Total Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Total Expenses', value: `₹${stats.total_expenses.toLocaleString()}`, icon: Receipt, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { title: 'Net Profit', value: `₹${stats.profit.toLocaleString()}`, icon: PiggyBank, color: stats.profit >= 0 ? 'bg-green-500' : 'bg-red-500', textColor: stats.profit >= 0 ? 'text-green-600' : 'text-red-600' },
    { title: 'Pending Invoices', value: stats.pending_invoices, icon: FileText, color: 'bg-purple-500', textColor: 'text-purple-600' }
  ];

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Pending Bills</span>
              <span className="font-bold text-gray-900">{stats.pending_bills}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Pending Invoices</span>
              <span className="font-bold text-gray-900">{stats.pending_invoices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-green-700">Profit Margin</span>
              <span className="font-bold text-green-900">
                {stats.total_revenue > 0 ? ((stats.profit / stats.total_revenue) * 100).toFixed(2) : 0}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/invoices')} className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <Receipt className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900">View Invoices</h3>
              <p className="text-sm text-gray-600">Customer invoices</p>
            </button>
            <button onClick={() => navigate('/supplier-bills')} className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <FileText className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Supplier Bills</h3>
              <p className="text-sm text-gray-600">Accounts payable</p>
            </button>
            <button onClick={() => navigate('/balance-sheet')} className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <PiggyBank className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-semibold text-gray-900">Balance Sheet</h3>
              <p className="text-sm text-gray-600">View financial reports</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;