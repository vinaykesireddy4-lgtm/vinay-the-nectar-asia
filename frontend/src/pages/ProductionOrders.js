import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Eye, Edit2, Trash2, Search, Play, CheckCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductionOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/production-orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast.error('Failed to fetch production orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this production order?')) return;

    try {
      await axios.delete(`${API}/production-orders/${id}`);
      toast.success('Production order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting production order:', error);
      toast.error('Failed to delete production order');
    }
  };

  const startProduction = async (id) => {
    try {
      await axios.post(`${API}/production-orders/${id}/start`);
      toast.success('Production started successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error starting production:', error);
      toast.error('Failed to start production');
    }
  };

  const completeProduction = async (id) => {
    if (!window.confirm('Are you sure you want to mark this production as completed? This will update the inventory.')) return;
    
    try {
      await axios.post(`${API}/production-orders/${id}/complete`);
      toast.success('Production completed successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error completing production:', error);
      toast.error('Failed to complete production');
    }
  };

  const handleRequestMaterials = async (order) => {
    // Navigate to request purchase page with production order context
    if (!order.materials_required || order.materials_required.length === 0) {
      toast.error('No materials required for this production order');
      return;
    }

    // Prepare items for purchase request based on materials_required
    const purchaseItems = order.materials_required.map(mat => ({
      material_type: mat.material_type === 'raw' ? 'raw_material' : 'packing_material',
      material_id: mat.material_id,
      material_name: mat.material_name,
      quantity: mat.required_quantity - (mat.allocated_quantity || 0),
      unit: mat.unit,
      estimated_cost: 0 // User will fill this
    }));

    // Store in session storage and navigate
    sessionStorage.setItem('purchaseRequestItems', JSON.stringify(purchaseItems));
    sessionStorage.setItem('purchaseRequestNote', `Materials needed for Production Order: ${order.order_number} - ${order.product_name}`);
    
    navigate('/request-purchase');
    toast.info('Redirecting to purchase request form with materials pre-filled');
  };


  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: 'Draft',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Orders</h1>
          <p className="text-gray-500 mt-1">Manage manufacturing and production</p>
        </div>
        <Button
          onClick={() => navigate('/create-production-order')}
          className="bg-indigo-600 hover:bg-indigo-700"
          data-testid="create-production-order-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Production Order
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-production-orders-input"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No production orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50" data-testid={`production-order-row-${order.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-indigo-600">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity_to_produce}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.sales_order_number ? (
                        <span className="text-blue-600 font-medium">{order.sales_order_number}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* Request Materials Button - for draft and scheduled orders */}
                        {(order.status === 'draft' || order.status === 'scheduled') && order.materials_required?.length > 0 && (
                          <button
                            onClick={() => handleRequestMaterials(order)}
                            className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                            title="Request Materials"
                            data-testid={`request-materials-${order.id}`}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Edit Button - for draft orders */}
                        {order.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/edit-production-order/${order.id}`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                            data-testid={`edit-production-order-${order.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        {order.status === 'scheduled' && (
                          <button
                            onClick={() => startProduction(order.id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="Start Production"
                            data-testid={`start-production-${order.id}`}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => completeProduction(order.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="Complete Production"
                            data-testid={`complete-production-${order.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* View Button - always available */}
                        <button
                          onClick={() => navigate(`/production-orders/${order.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                          data-testid={`view-production-order-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Delete Button - for draft and cancelled orders */}
                        {(order.status === 'draft' || order.status === 'cancelled') && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            data-testid={`delete-production-order-${order.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
  );
};

export default ProductionOrders;