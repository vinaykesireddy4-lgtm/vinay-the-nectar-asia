import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Send, Download, Eye, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    customer_gstin: '',
    payment_terms: 'Net 30',
    notes: '',
    send_whatsapp: false,
    items: [{
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      amount: 0
    }]
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    }
  };

  const calculateItemAmount = (item) => {
    const baseAmount = item.quantity * item.unit_price;
    const taxAmount = (baseAmount * item.tax_rate) / 100;
    return baseAmount + taxAmount;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    formData.items.forEach(item => {
      const baseAmount = item.quantity * item.unit_price;
      subtotal += baseAmount;
      taxAmount += (baseAmount * item.tax_rate) / 100;
    });

    const total = subtotal + taxAmount;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      total_amount: total.toFixed(2)
    };
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        amount: 0
      }]
    });
  };

  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const updateItem = (index, field, value) => {
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      [field]: value
    };
    
    // Calculate amount
    items[index].amount = calculateItemAmount(items[index]);
    
    setFormData({ ...formData, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totals = calculateTotals();
    
    const invoiceData = {
      ...formData,
      subtotal: parseFloat(totals.subtotal),
      tax_amount: parseFloat(totals.tax_amount),
      total_amount: parseFloat(totals.total_amount),
      invoice_date: new Date(formData.invoice_date).toISOString(),
      due_date: new Date(formData.due_date).toISOString()
    };

    try {
      if (editingId) {
        await axios.put(`${API}/invoices/${editingId}`, invoiceData);
        toast.success('Invoice updated successfully!');
      } else {
        const response = await axios.post(`${API}/invoices`, invoiceData);
        if (response.data.whatsapp_sent) {
          toast.success('Invoice created and sent via WhatsApp!');
        } else {
          toast.success('Invoice created successfully!');
        }
      }
      
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to save invoice');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_address: '',
      customer_gstin: '',
      payment_terms: 'Net 30',
      notes: '',
      send_whatsapp: false,
      items: [{
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        amount: 0
      }]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setFormData({
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date.split('T')[0],
      due_date: invoice.due_date.split('T')[0],
      customer_name: invoice.customer_name,
      customer_phone: invoice.customer_phone,
      customer_email: invoice.customer_email || '',
      customer_address: invoice.customer_address || '',
      customer_gstin: invoice.customer_gstin || '',
      payment_terms: invoice.payment_terms || 'Net 30',
      notes: invoice.notes || '',
      send_whatsapp: false,
      items: invoice.items
    });
    setEditingId(invoice.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await axios.delete(`${API}/invoices/${id}`);
      toast.success('Invoice deleted successfully!');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleSendWhatsApp = async (id) => {
    try {
      const response = await axios.post(`${API}/invoices/${id}/send-whatsapp`);
      if (response.data.success) {
        toast.success('Invoice sent via WhatsApp!');
        fetchInvoices();
      } else {
        toast.error('Failed to send via WhatsApp');
      }
    } catch (error) {
      toast.error('Error sending WhatsApp');
    }
  };

  const handleDownloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await axios.get(`${API}/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-testid="create-invoice-btn">
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Invoice'}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'paid').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {invoices.filter(i => i.status === 'sent').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold">
            ₹{invoices.reduce((sum, inv) => sum + inv.total_amount, 0).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Invoice Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Invoice Number *</Label>
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                  placeholder="INV-001"
                />
              </div>
              <div>
                <Label>Invoice Date *</Label>
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    placeholder="ABC Dealers"
                  />
                </div>
                <div>
                  <Label>Phone Number * (with country code)</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    required
                    placeholder="919876543210"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="dealer@example.com"
                  />
                </div>
                <div>
                  <Label>GSTIN</Label>
                  <Input
                    value={formData.customer_gstin}
                    onChange={(e) => setFormData({ ...formData, customer_gstin: e.target.value })}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Items</h3>
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-3">
                        <Label className="text-xs">Item Name *</Label>
                        <Input
                          value={item.item_name}
                          onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                          required
                          placeholder="Product name"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Details"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-xs">Qty *</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">Rate *</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-xs">Tax%</Label>
                        <Input
                          type="number"
                          value={item.tax_rate}
                          onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Totals */}
              <Card className="p-4 mt-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">₹{totals.tax_amount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{totals.total_amount}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <Label>Payment Terms</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                >
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>

            {/* WhatsApp Option */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.send_whatsapp}
                  onChange={(e) => setFormData({ ...formData, send_whatsapp: e.target.checked })}
                  className="w-4 h-4"
                />
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Send invoice to customer via WhatsApp automatically</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" data-testid="save-invoice-btn">
                {editingId ? 'Update Invoice' : 'Create Invoice'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Invoices List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No invoices yet. Create your first invoice!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{invoice.customer_name}</p>
                        <p className="text-xs text-gray-500">{invoice.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{invoice.invoice_date.split('T')[0]}</td>
                    <td className="px-4 py-3 text-sm font-semibold">₹{invoice.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {invoice.whatsapp_sent ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Sent
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendWhatsApp(invoice.id)}
                          title="Send via WhatsApp"
                          className="text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(invoice)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceManagement;
