import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreatePaymentReceived = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [formData, setFormData] = useState({
    partner_id: '',
    partner_name: '',
    payment_method: 'bank',
    payment_amount: '',
    bank_reference: '',
    cheque_number: '',
    upi_transaction_id: '',
    memo: '',
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchOutstandingInvoices();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchOutstandingInvoices = async () => {
    try {
      const response = await axios.get(`${API}/reports/outstanding-invoices?invoice_type=sales`);
      setOutstandingInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({ ...formData, partner_id: customerId, partner_name: customer.name });
    }
  };

  const handleInvoiceToggle = (invoice, amount) => {
    const existing = selectedInvoices.find(i => i.invoice_id === invoice.invoice_id);
    if (existing) {
      setSelectedInvoices(selectedInvoices.filter(i => i.invoice_id !== invoice.invoice_id));
    } else {
      setSelectedInvoices([...selectedInvoices, {
        invoice_id: invoice.invoice_id,
        invoice_number: invoice.invoice_number,
        invoice_type: 'sales_invoice',
        allocated_amount: parseFloat(amount) || 0
      }]);
    }
  };

  const updateAllocation = (invoiceId, amount) => {
    setSelectedInvoices(selectedInvoices.map(inv =>
      inv.invoice_id === invoiceId ? { ...inv, allocated_amount: parseFloat(amount) || 0 } : inv
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/payments`, {
        payment_type: 'receive',
        partner_type: 'customer',
        ...formData,
        payment_amount: parseFloat(formData.payment_amount),
        allocations: selectedInvoices,
        status: 'posted'
      });
      toast.success('Payment received successfully');
      navigate('/payment-received');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to record payment');
    }
  };

  const customerInvoices = formData.partner_id
    ? outstandingInvoices.filter(inv => inv.partner_id === formData.partner_id)
    : [];

  const totalAllocated = selectedInvoices.reduce((sum, inv) => sum + inv.allocated_amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/payment-received')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Receive Payment</h1>
        <p className="text-gray-500 mt-1">Record payment received from customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer *</Label>
              <Select value={formData.partner_id} onValueChange={handleCustomerChange} required>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method *</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount Received *</Label>
              <Input type="number" step="0.01" value={formData.payment_amount}
                onChange={(e) => setFormData({...formData, payment_amount: e.target.value})} required />
            </div>
            <div>
              <Label>Reference Number</Label>
              <Input value={formData.bank_reference}
                onChange={(e) => setFormData({...formData, bank_reference: e.target.value})}
                placeholder={formData.payment_method === 'cheque' ? 'Cheque Number' : 'Transaction ID'} />
            </div>
            <div className="col-span-2">
              <Label>Memo</Label>
              <Textarea value={formData.memo} onChange={(e) => setFormData({...formData, memo: e.target.value})} />
            </div>
          </div>
        </div>

        {customerInvoices.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Allocate to Invoices</h2>
            <div className="space-y-2">
              {customerInvoices.map(inv => (
                <div key={inv.invoice_id} className="flex items-center gap-4 p-3 border rounded">
                  <input type="checkbox"
                    onChange={(e) => handleInvoiceToggle(inv, inv.outstanding_amount)}
                    checked={selectedInvoices.some(i => i.invoice_id === inv.invoice_id)} />
                  <div className="flex-1">
                    <div className="font-medium">{inv.invoice_number}</div>
                    <div className="text-sm text-gray-500">Outstanding: ₹{inv.outstanding_amount.toFixed(2)}</div>
                  </div>
                  {selectedInvoices.some(i => i.invoice_id === inv.invoice_id) && (
                    <Input type="number" step="0.01" placeholder="Amount"
                      className="w-32"
                      value={selectedInvoices.find(i => i.invoice_id === inv.invoice_id)?.allocated_amount || ''}
                      onChange={(e) => updateAllocation(inv.invoice_id, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between">
                <span>Total Allocated:</span>
                <span className="font-semibold">₹{totalAllocated.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Unallocated:</span>
                <span>₹{(parseFloat(formData.payment_amount || 0) - totalAllocated).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/payment-received')}>Cancel</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" /> Receive Payment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePaymentReceived;