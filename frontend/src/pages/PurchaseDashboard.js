import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, FileText, ShoppingCart, Package, CheckCircle, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_suppliers: 0,
    pending_purchase_requests: 0,
    total_purchase_orders: 0,
    pending_purchase_orders: 0,
    pending_grns: 0,
    total_purchase_value: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/purchase/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Suppliers', value: stats.total_suppliers, icon: Truck, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { title: 'Pending Requests', value: stats.pending_purchase_requests, icon: FileText, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { title: 'Purchase Orders', value: stats.total_purchase_orders, icon: ShoppingCart, color: 'bg-green-500', textColor: 'text-green-600' },
    { title: 'Pending POs', value: stats.pending_purchase_orders, icon: Package, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { title: 'Pending GRNs', value: stats.pending_grns, icon: CheckCircle, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { title: 'Total Purchase Value', value: `₹${stats.total_purchase_value.toLocaleString()}`, icon: DollarSign, color: 'bg-indigo-500', textColor: 'text-indigo-600' }
  ];

  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Purchase Dashboard</h1>

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
          <button onClick={() => navigate('/suppliers')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <Truck className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">View Suppliers</h3>
            <p className="text-sm text-gray-600">Manage supplier database</p>
          </button>
          <button onClick={() => navigate('/pending-approvals')} className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <FileText className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <p className="text-sm text-gray-600">Review purchase requests</p>
          </button>
          <button onClick={() => navigate('/purchase-orders')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Purchase Orders</h3>
            <p className="text-sm text-gray-600">View all POs</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseDashboard;