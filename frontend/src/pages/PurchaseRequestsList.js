import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Eye, RefreshCw, ShoppingCart, AlertTriangle, Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PurchaseRequestsList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form data
  const [approverName, setApproverName] = useState('Purchase Manager');
  const [supplierId, setSupplierId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/purchase-requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching purchase requests:', error);
      toast.error('Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
  };

  const handleApprove = async () => {
    if (!approverName.trim()) {
      toast.error('Please enter approver name');
      return;
    }

    try {
      await axios.post(`${API}/purchase-requests/${selectedRequest.id}/approve`, {
        approved_by: approverName,
        supplier_id: supplierId || null
      });
      
      toast.success('Purchase request approved successfully!');
      setShowApproveDialog(false);
      setApproverName('Purchase Manager');
      setSupplierId('');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.detail || 'Failed to approve purchase request');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter rejection reason');
      return;
    }

    try {
      await axios.post(`${API}/purchase-requests/${selectedRequest.id}/reject`, {
        reason: rejectionReason,
        rejected_by: approverName
      });
      
      toast.success('Purchase request rejected');
      setShowRejectDialog(false);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject purchase request');
    }
  };

  const openApproveDialog = (request) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const openViewDialog = (request) => {
    setSelectedRequest(request);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading purchase requests...</div>;
  }

  return (
    <div className="p-8" data-testid="purchase-requests-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-indigo-600" />
          Purchase Requests
        </h1>
        <p className="text-gray-500 mt-1">Manage and approve purchase requests from inventory team</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-green-700">Approved</p>
          <p className="text-2xl font-bold text-green-900">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
          <p className="text-sm text-red-700">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {requests.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <Input
              placeholder="Search by request number, requester, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchRequests} data-testid="refresh-button">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/request-purchase')} data-testid="create-request-button">
            <ShoppingCart className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pricing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No purchase requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50" data-testid={`request-row-${request.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.request_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.request_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.requested_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Cost to be determined by Purchase Manager
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(request)}
                          data-testid={`view-button-${request.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApproveDialog(request)}
                              className="text-green-600 hover:text-green-700"
                              data-testid={`approve-button-${request.id}`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRejectDialog(request)}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`reject-button-${request.id}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/quote-purchase-request/${request.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            data-testid={`quote-button-${request.id}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Quote
                          </Button>
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
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested By</p>
                  <p className="font-semibold">{selectedRequest.requested_by}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedRequest.request_date).toLocaleDateString()}
                  </p>
                </div>
                {selectedRequest.approved_by && (
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.status === 'approved' ? 'Approved By' : 'Rejected By'}
                    </p>
                    <p className="font-semibold">{selectedRequest.approved_by}</p>
                  </div>
                )}
                {selectedRequest.approved_at && (
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.status === 'approved' ? 'Approved At' : 'Rejected At'}
                    </p>
                    <p className="font-semibold">
                      {new Date(selectedRequest.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-700 font-medium">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              {selectedRequest.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-700 font-medium">Notes:</p>
                  <p className="text-sm text-blue-600">{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Items Requested</h4>
                <div className="border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity Required</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedRequest.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm font-medium">{item.material_name}</td>
                          <td className="px-4 py-2 text-sm capitalize">
                            {item.material_type?.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.quantity} {item.unit}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-yellow-50">
                        <td colSpan="3" className="px-4 py-3 text-sm text-yellow-800">
                          <strong>Note:</strong> Purchase Manager will determine final costs and suppliers
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Request</DialogTitle>
            <DialogDescription>
              Approve request {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <Input
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                placeholder="Purchase Manager"
                data-testid="approver-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Supplier (Optional)
              </label>
              <Select value={supplierId || "none"} onValueChange={(val) => setSupplierId(val === "none" ? "" : val)}>
                <SelectTrigger data-testid="supplier-select">
                  <SelectValue placeholder="Select supplier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} data-testid="confirm-approve-button">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Request</DialogTitle>
            <DialogDescription>
              Reject request {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows="4"
                placeholder="Explain why this request is being rejected..."
                data-testid="rejection-reason-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              data-testid="confirm-reject-button"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseRequestsList;
