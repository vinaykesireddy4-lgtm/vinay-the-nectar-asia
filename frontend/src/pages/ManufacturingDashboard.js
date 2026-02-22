import { useState, useEffect } from 'react';
import axios from 'axios';
import { Factory, PlayCircle, Clock, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ManufacturingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_boms: 0,
    active_production_orders: 0,
    pending_production_orders: 0,
    completed_today: 0,
    total_production_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/manufacturing/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total BOMs', value: stats.total_boms, icon: FileText, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Active Production', value: stats.active_production_orders, icon: PlayCircle, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Pending Orders', value: stats.pending_production_orders, icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { title: 'Completed Today', value: stats.completed_today, icon: CheckCircle, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { title: 'Total Orders', value: stats.total_production_orders, icon: Factory, color: 'bg-indigo-500', textColor: 'text-indigo-600' }
  ];

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manufacturing Dashboard</h1>

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
          <button onClick={() => navigate('/bom')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">View BOMs</h3>
            <p className="text-sm text-gray-600">Bill of Materials</p>
          </button>
          <button onClick={() => navigate('/production-orders')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <Factory className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Production Orders</h3>
            <p className="text-sm text-gray-600">Manage orders</p>
          </button>
          <button onClick={() => navigate('/production-orders/create')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <PlayCircle className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Create Order</h3>
            <p className="text-sm text-gray-600">Start production</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ManufacturingDashboard;