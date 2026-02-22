import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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

const QuotePurchaseRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [quotedBy, setQuotedBy] = useState('Purchase Manager');

  useEffect(() => {
    fetchRequestAndSuppliers();
  }, [id]);

  const fetchRequestAndSuppliers = async () => {
    try {
      setLoading(true);
      const [requestRes, suppliersRes] = await Promise.all([
        axios.get(`${API}/purchase-requests`),
        axios.get(`${API}/suppliers`)
      ]);
      
      const foundRequest = requestRes.data.find(r => r.id === id);
      if (!foundRequest) {
        toast.error('Purchase request not found');
        navigate('/purchase-requests');
        return;
      }
      
      if (foundRequest.status !== 'approved') {
        toast.error('Request must be approved first');
        navigate('/purchase-requests');
        return;
      }
      
      setRequest(foundRequest);
      setSuppliers(suppliersRes.data);
      
      // Initialize items with existing data
      setItems(foundRequest.items.map(item => ({
        ...item,
        unit_cost: item.unit_cost || 0,
        gst_rate: item.gst_rate || 0
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_cost || 0);
      return sum + itemTotal;
    }, 0);
    
    const taxAmount = items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_cost || 0);
      const tax = (itemTotal * (item.gst_rate || 0)) / 100;
      return sum + tax;
    }, 0);
    
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }
    
    if (!quotedBy.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    // Validate all items have costs
    const invalidItems = items.filter(item => !item.unit_cost || item.unit_cost <= 0);
    if (invalidItems.length > 0) {
      toast.error('Please add costs for all items');
      return;
    }
    
    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      const totals = calculateTotals();
      
      await axios.post(`${API}/purchase-requests/${id}/quote`, {
        supplier_id: selectedSupplier,
        supplier_name: supplier?.name || '',
        items: items,
        quoted_by: quotedBy,
        total_cost: totals.total
      });
      
      toast.success('Quote submitted successfully! Sent to Finance Manager for approval.');
      navigate('/purchase-requests');
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit quote');
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!request) {
    return <div className="p-8 text-center">Request not found</div>;
  }

  return (
    <div className="p-8" data-testid="quote-purchase-request-page">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/purchase-requests')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Purchase Requests
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">Add Quote to Purchase Request</h1>
        <p className="text-gray-500 mt-1">
          Request #{request.request_number} - Add pricing and supplier details
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Request Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Request Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Requested By:</span>
                <span className="ml-2 font-medium">{request.requested_by}</span>
              </div>
              <div>
                <span className="text-blue-700">Date:</span>
                <span className="ml-2 font-medium">
                  {new Date(request.request_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            {request.notes && (
              <div className="mt-2 text-sm">
                <span className="text-blue-700">Notes:</span>
                <span className="ml-2">{request.notes}</span>
              </div>
            )}
          </div>

          {/* Supplier Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select Supplier *</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger data-testid="supplier-select">
                    <SelectValue placeholder="Choose supplier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quoted By *
                </label>
                <Input
                  value={quotedBy}
                  onChange={(e) => setQuotedBy(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Items with Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Pricing for Items</h3>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <div className="text-sm font-medium text-gray-900">{item.material_name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {item.material_type?.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity Required
                      </label>
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cost per {item.unit} *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        GST Rate (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gst_rate}
                        onChange={(e) => updateItem(index, 'gst_rate', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total Amount
                      </label>
                      <div className="text-sm font-bold text-gray-900 mt-2">
                        ₹{((item.quantity * item.unit_cost) * (1 + (item.gst_rate / 100))).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-indigo-600">₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/purchase-requests')}
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="submit-quote-button">
              <Save className="h-4 w-4 mr-2" />
              Submit Quote for Finance Approval
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuotePurchaseRequest;
