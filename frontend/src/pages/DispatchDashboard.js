import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DispatchDashboard = () => {
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const fetchReadyOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/dispatch/ready-orders`);
      setReadyOrders(response.data);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createDeliveryChallan = (order) => {
    // Navigate to create delivery challan with pre-filled data
    navigate('/delivery-challans/create', { 
      state: { 
        salesOrder: order 
      } 
    });
  };

  const markDispatched = async (orderId) => {
    if (!window.confirm('Mark this order as dispatched?')) return;
    
    try {
      await axios.post(`${API}/dispatch/mark-dispatched/${orderId}`);
      toast.success('Order marked as dispatched');
      fetchReadyOrders();
    } catch (error) {
      console.error('Error marking dispatched:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ready: 'bg-green-100 text-green-800',
      dispatched: 'bg-blue-100 text-blue-800',
      delivered: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-indigo-600" />
            Dispatch Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Orders ready for dispatch - Production completed
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready to Dispatch</p>
                <p className="text-2xl font-semibold text-gray-900">{readyOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Orders Ready for Dispatch</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : readyOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No orders ready for dispatch</p>
                      <p className="text-xs text-gray-400 mt-1">Orders will appear here once production is completed</p>
                    </td>
                  </tr>
                ) : (
                  readyOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-indigo-600">
                          {order.so_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item.product_name} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.grand_total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.dispatch_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => createDeliveryChallan(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            title="Create Delivery Challan"
                          >
                            <Package className="h-4 w-4" />
                            Create Challan
                          </button>
                          <button
                            onClick={() => markDispatched(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                            title="Mark as Dispatched"
                          >
                            <Truck className="h-4 w-4" />
                            Dispatch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchDashboard;
