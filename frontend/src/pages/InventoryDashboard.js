import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Box, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_raw_materials: 0,
    total_finished_goods: 0,
    total_packing_materials: 0,
    low_stock_items: 0,
    pending_approvals: 0,
    total_stock_value: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/inventory/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Raw Materials', value: stats.total_raw_materials, icon: Package, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Finished Goods', value: stats.total_finished_goods, icon: Box, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Packing Materials', value: stats.total_packing_materials, icon: Package, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { title: 'Low Stock Items', value: stats.low_stock_items, icon: AlertTriangle, color: 'bg-red-500', textColor: 'text-red-600' },
    { title: 'Pending Approvals', value: stats.pending_approvals, icon: CheckCircle, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { title: 'Total Stock Value', value: `₹${stats.total_stock_value.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-500', textColor: 'text-indigo-600' }
  ];

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>

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
          <button onClick={() => navigate('/raw-materials')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <Package className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">View Raw Materials</h3>
            <p className="text-sm text-gray-600">Check inventory levels</p>
          </button>
          <button onClick={() => navigate('/finished-goods')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <Box className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Finished Goods</h3>
            <p className="text-sm text-gray-600">View ready products</p>
          </button>
          <button onClick={() => navigate('/pending-approvals')} className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <CheckCircle className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-sm text-gray-600">Review requests</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default InventoryDashboard;