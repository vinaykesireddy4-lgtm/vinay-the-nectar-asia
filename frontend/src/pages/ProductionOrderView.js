import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Play, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductionOrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/production-orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching production order:', error);
      toast.error('Failed to fetch production order');
    } finally {
      setLoading(false);
    }
  };

  const handleStartProduction = async () => {
    if (!window.confirm('Start production for this order?')) return;

    try {
      await axios.post(`${API}/production-orders/${id}/start`);
      toast.success('Production started successfully');
      fetchOrder();
    } catch (error) {
      console.error('Error starting production:', error);
      toast.error('Failed to start production');
    }
  };

  const handleCompleteProduction = async () => {
    if (!window.confirm('Complete production? This will deduct materials from stock and add finished goods.')) return;

    try {
      await axios.post(`${API}/production-orders/${id}/complete`);
      toast.success('Production completed successfully! Materials deducted and finished goods added to stock.');
      fetchOrder();
    } catch (error) {
      console.error('Error completing production:', error);
      toast.error('Failed to complete production');
    }
  };

  const handleCancelProduction = async () => {
    if (!window.confirm('Cancel this production order?')) return;

    try {
      await axios.put(`${API}/production-orders/${id}`, { status: 'cancelled' });
      toast.success('Production order cancelled');
      fetchOrder();
    } catch (error) {
      console.error('Error cancelling production:', error);
      toast.error('Failed to cancel production order');
    }
  };

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-red-600">Production order not found</div>;
  }

  return (
    <div className="p-8">
      <Button
        variant="outline"
        onClick={() => navigate('/production-orders')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Production Orders
      </Button>

      <div className="flex gap-4 mb-6 no-print">
        <Button
          onClick={() => navigate(`/production-orders/${id}/batch-sheet`)}
          variant="outline"
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-300"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Batch Sheet
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-500 mt-1">Production Order Details</p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
            <p className="text-lg font-semibold text-gray-900">{order.product_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity to Produce</h3>
            <p className="text-lg font-semibold text-gray-900">{order.quantity_to_produce}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created Date</h3>
            <p className="text-lg text-gray-900">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          {order.start_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
              <p className="text-lg text-gray-900">{new Date(order.start_date).toLocaleString('en-IN')}</p>
            </div>
          )}
          {order.completion_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Date</h3>
              <p className="text-lg text-gray-900">{new Date(order.completion_date).toLocaleString('en-IN')}</p>
            </div>
          )}
          {order.notes && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {order.materials_required && order.materials_required.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Materials Required</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.materials_required.map((material, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        material.material_type === 'raw' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {material.material_type === 'raw' ? 'Raw Material' : 'Packing Material'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{material.material_name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.required_quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{material.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {order.status === 'draft' && (
          <>
            <Button
              onClick={handleStartProduction}
              className="bg-green-600 hover:bg-green-700"
              data-testid="start-production-btn"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Production
            </Button>
            <Button
              onClick={handleCancelProduction}
              variant="destructive"
              data-testid="cancel-production-btn"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </>
        )}

        {order.status === 'scheduled' && (
          <>
            <Button
              onClick={handleStartProduction}
              className="bg-green-600 hover:bg-green-700"
              data-testid="start-production-btn"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Production
            </Button>
            <Button
              onClick={handleCancelProduction}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </Button>
          </>
        )}

        {order.status === 'in_progress' && (
          <Button
            onClick={handleCompleteProduction}
            className="bg-indigo-600 hover:bg-indigo-700"
            data-testid="complete-production-btn"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Production
          </Button>
        )}

        {order.status === 'completed' && (
          <div className="text-green-600 font-medium flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Production Completed Successfully
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="text-red-600 font-medium flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            Production Order Cancelled
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionOrderView;
