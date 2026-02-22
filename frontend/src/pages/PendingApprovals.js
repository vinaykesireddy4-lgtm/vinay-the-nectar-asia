import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, RefreshCw, Package, AlertTriangle, Box } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PendingApprovals = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'production'
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approverName, setApproverName] = useState('Production Manager');
  const [inventoryStatus, setInventoryStatus] = useState({});

  useEffect(() => {
    fetchAllApprovals();
  }, []);

  const fetchAllApprovals = async () => {
    try {
      setLoading(true);
      
      // Fetch sales orders
      const salesResponse = await axios.get(`${API}/sales-orders/pending-approval/list`);
      const ordersData = salesResponse.data;
      setSalesOrders(ordersData);
      
      // Fetch production orders (pending approval - draft status)
      const productionResponse = await axios.get(`${API}/production-orders/pending-approval/list`);
      setProductionOrders(productionResponse.data);
      
      // Check inventory for each sales order
      for (const order of ordersData) {
        await checkInventoryStatus(order);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const checkInventoryStatus = async (order) => {
    try {
      // Check inventory for each item in the order
      const itemChecks = await Promise.all(
        order.items.map(async (item) => {
          try {
            const response = await axios.get(`${API}/products/${item.product_id}`);
            const product = response.data;
            const available = product.quantity || 0;
            const needed = item.quantity;
            return {
              product_id: item.product_id,
              product_name: item.product_name,
              available,
              needed,
              sufficient: available >= needed
            };
          } catch (err) {
            return {
              product_id: item.product_id,
              product_name: item.product_name,
              available: 0,
              needed: item.quantity,
              sufficient: false
            };
          }
        })
      );

      const allSufficient = itemChecks.every(item => item.sufficient);
      
      setInventoryStatus(prev => ({
        ...prev,
        [order.id]: {
          allSufficient,
          items: itemChecks
        }
      }));
    } catch (error) {
      console.error('Error checking inventory:', error);
    }
  };

  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setShowApprovalDialog(true);
  };

  const handleApprove = async (needsProduction) => {
    try {
      await axios.post(`${API}/sales-orders/${selectedOrder.id}/approve`, {
        approved_by: approverName,
        needs_production: needsProduction
      });
      
      const status = inventoryStatus[selectedOrder.id];
      const message = status?.allSufficient && !needsProduction
        ? `Order ${selectedOrder.so_number} approved! ✅ Ready to ship from inventory.`
        : `Order ${selectedOrder.so_number} approved! 📦 Sent to production.`;
      
      toast.success(message);
      setShowApprovalDialog(false);
      fetchAllApprovals();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve order');
    }
  };

  const handleApproveProductionOrder = async () => {
    if (!approverName.trim()) {
      toast.error('Please enter approver name');
      return;
    }

    try {
      await axios.post(`${API}/production-orders/${selectedProduction.id}/approve`, {
        approved_by: approverName
      });
      
      toast.success(`Production order ${selectedProduction.order_number} approved and scheduled!`);
      setShowApprovalDialog(false);
      fetchAllApprovals();
    } catch (error) {
      console.error('Error approving production order:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve production order');
    }
  };

  const handleRejectProductionOrder = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await axios.post(`${API}/production-orders/${selectedProduction.id}/reject`, {
        reason: rejectionReason,
        rejected_by: approverName
      });
      
      toast.success(`Production order ${selectedProduction.order_number} rejected`);
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchAllApprovals();
    } catch (error) {
      console.error('Error rejecting production order:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject production order');
    }
  };

  const handleRejectClick = (item, type = 'sales') => {
    if (type === 'sales') {
      setSelectedOrder(item);
      setSelectedProduction(null);
    } else if (type === 'production') {
      setSelectedProduction(item);
      setSelectedOrder(null);
    }
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      if (selectedOrder) {
        // Reject sales order
        await axios.post(`${API}/sales-orders/${selectedOrder.id}/reject`, {
          reason: rejectionReason,
          rejected_by: approverName
        });
        toast.success(`Sales order ${selectedOrder.so_number} rejected`);
      } else if (selectedProduction) {
        // Reject production order
        await handleRejectProductionOrder();
        return;
      }
      
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchAllApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve sales orders & material requests (Inventory)</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Your Name"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={fetchAllApprovals}
            variant="outline"
            data-testid="refresh-btn"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sales'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            data-testid="sales-orders-tab"
          >
            Sales Orders ({salesOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'production'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            data-testid="production-orders-tab"
          >
            <Package className="inline h-4 w-4 mr-1" />
            Production Orders ({productionOrders.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {activeTab === 'sales' ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventory</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading pending approvals...
                    </td>
                  </tr>
                ) : salesOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      🎉 No pending sales orders! All caught up.
                    </td>
                  </tr>
                ) : (
                  salesOrders.map((order) => {
                    const status = inventoryStatus[order.id];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-indigo-600">{order.so_number}</span>
                          <br />
                          <span className="text-xs text-gray-500">{order.buyer_order_no}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.so_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₹{order.grand_total?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4">
                          {status ? (
                            status.allSufficient ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <Package className="h-4 w-4" />
                                <span className="text-xs font-medium">In Stock</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-medium">Needs Production</span>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">Checking...</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => handleApproveClick(order)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`approve-${order.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectClick(order, 'sales')}
                              size="sm"
                              variant="destructive"
                              data-testid={`reject-${order.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : activeTab === 'production' ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading production orders...
                    </td>
                  </tr>
                ) : productionOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      🏭 No pending production orders! All caught up.
                    </td>
                  </tr>
                ) : (
                  productionOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50" data-testid={`production-order-row-${order.id}`}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-indigo-600">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.product_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.quantity_to_produce}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => {
                              setSelectedProduction(order);
                              setApproverName('Production Manager');
                              setShowApprovalDialog(true);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`approve-production-${order.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectClick(order, 'production')}
                            size="sm"
                            variant="destructive"
                            data-testid={`reject-production-${order.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {/* Approval Dialog - for Sales Orders and Production Orders */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? `Approve Sales Order - ${selectedOrder.so_number}` : 
               selectedProduction ? `Approve Production Order - ${selectedProduction.order_number}` : 'Approve'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder ? 'Review inventory status and decide fulfillment method' : 
               selectedProduction ? 'Approve this production order to schedule for manufacturing' : 'Approve'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedOrder && inventoryStatus[selectedOrder.id] && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Inventory Status:</div>
                {inventoryStatus[selectedOrder.id].items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{item.product_name}</div>
                      <div className="text-xs text-gray-500">
                        Need: {item.needed} | Available: {item.available}
                      </div>
                    </div>
                    {item.sufficient ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                        <Package className="h-3 w-3" /> In Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Short: {item.needed - item.available}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            {selectedOrder && (
              <>
                {inventoryStatus[selectedOrder.id]?.allSufficient && (
                  <Button
                    onClick={() => handleApprove(false)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Approve & Ship from Stock
                  </Button>
                )}
                <Button
                  onClick={() => handleApprove(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Approve & Send to Production
                </Button>
              </>
            )}
            {selectedProduction && (
              <>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name (Production Manager) *
                  </label>
                  <Input
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Production Manager"
                    data-testid="production-approver-name"
                  />
                </div>
                <Button
                  onClick={handleApproveProductionOrder}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="confirm-production-approve"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Schedule Production
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? `Reject Sales Order - ${selectedOrder.so_number}` : 
               selectedProduction ? `Reject Production Order - ${selectedProduction.order_number}` : 'Reject'}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full px-3 py-2 border rounded"
              rows="4"
              placeholder="Reason for rejection (e.g., budget constraints, duplicate request, not needed)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              data-testid="rejection-reason-textarea"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} data-testid="confirm-reject-button">
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingApprovals;
