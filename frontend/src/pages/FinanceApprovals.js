import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, RefreshCw, DollarSign } from 'lucide-react';
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

const FinanceApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approverName, setApproverName] = useState('Finance Manager');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/purchase-requests/finance-pending/list`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching finance requests:', error);
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approverName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const response = await axios.post(`${API}/purchase-requests/${selectedRequest.id}/finance-approve`, {
        approved_by: approverName
      });
      
      toast.success(`Purchase request approved! Purchase Order ${response.data.po_number} created successfully.`);
      setShowApprovalDialog(false);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await axios.post(`${API}/purchase-requests/${selectedRequest.id}/finance-reject`, {
        reason: rejectionReason,
        rejected_by: approverName
      });
      
      toast.success('Purchase request rejected');
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject request');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8" data-testid="finance-approvals-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          Finance Approvals
        </h1>
        <p className="text-gray-500 mt-1">Review and approve purchase requests with budget confirmation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-600">{requests.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{requests.reduce((sum, r) => sum + (r.total_cost || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-end">
            <Button onClick={fetchRequests} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quoted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    💰 No purchase requests pending finance approval!
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50" data-testid={`request-row-${request.id}`}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-indigo-600">{request.request_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.requested_by}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.supplier_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.quoted_by || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      ₹{request.total_cost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowViewDialog(true);
                          }}
                          data-testid={`view-button-${request.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalDialog(true);
                          }}
                          data-testid={`approve-button-${request.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve & Create PO
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                          data-testid={`reject-button-${request.id}`}
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
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Request Number</p>
                  <p className="font-semibold">{selectedRequest.request_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested By</p>
                  <p className="font-semibold">{selectedRequest.requested_by}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="font-semibold">{selectedRequest.supplier_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quoted By</p>
                  <p className="font-semibold">{selectedRequest.quoted_by}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedRequest.request_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-semibold text-xl text-green-600">
                    ₹{selectedRequest.total_cost?.toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-700 font-medium">Notes:</p>
                  <p className="text-sm text-blue-600">{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Items with Pricing</h4>
                <div className="border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cost/Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">GST %</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRequest.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{item.material_name}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-2 text-sm">₹{item.unit_cost?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">{item.gst_rate}%</td>
                          <td className="px-4 py-2 text-sm font-medium">
                            ₹{((item.quantity * item.unit_cost) * (1 + item.gst_rate / 100)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="4" className="px-4 py-2 text-right text-sm">Grand Total:</td>
                        <td className="px-4 py-2 text-sm text-green-600">
                          ₹{selectedRequest.total_cost?.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finance Approval - {selectedRequest?.request_number}</DialogTitle>
            <DialogDescription>
              Approve budget and create Purchase Order
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-blue-700">Supplier:</span>
                    <span className="ml-2 font-medium">{selectedRequest.supplier_name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Items:</span>
                    <span className="ml-2 font-medium">{selectedRequest.items?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Quoted By:</span>
                    <span className="ml-2 font-medium">{selectedRequest.quoted_by}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Cost:</span>
                    <span className="ml-2 font-bold text-lg text-blue-900">
                      ₹{selectedRequest.total_cost?.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  <strong>⚠️ Note:</strong> Approving will automatically create a Purchase Order for ₹{selectedRequest.total_cost?.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name (Finance Manager) *
                </label>
                <Input
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="Finance Manager"
                  data-testid="approver-name-input"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" data-testid="confirm-approve-button">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Create PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Request - {selectedRequest?.request_number}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full px-3 py-2 border rounded"
              rows="4"
              placeholder="Reason for rejection (e.g., exceeds budget, not aligned with priorities)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              data-testid="rejection-reason-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} data-testid="confirm-reject-button">
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceApprovals;
