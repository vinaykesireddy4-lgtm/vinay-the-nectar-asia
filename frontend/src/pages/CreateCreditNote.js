import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateCreditNote = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchInvoices();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        product_name: '',
        hsn_code: '',
        quantity: 1,
        unit: 'pcs',
        price: 0,
        discount_percent: 0,
        gst_rate: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === 'product_id' && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].hsn_code = product.hsn_code || '';
        newItems[index].price = product.price;
        newItems[index].unit = product.unit;
        newItems[index].gst_rate = product.gst_rate;
      }
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * (item.discount_percent / 100);
      const itemTaxable = itemSubtotal - discountAmount;
      const itemGst = itemTaxable * (item.gst_rate / 100);

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      taxableAmount += itemTaxable;
      totalGst += itemGst;
    });

    const grandTotal = taxableAmount + totalGst;

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalGst,
      grandTotal,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (!selectedInvoice) {
      toast.error('Please select an invoice');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (items.some((item) => !item.product_id)) {
      toast.error('Please select products for all items');
      return;
    }

    try {
      const creditNoteData = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        invoice_number: selectedInvoice,
        reason: reason,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          hsn_code: item.hsn_code,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          price: parseFloat(item.price),
          discount_percent: parseFloat(item.discount_percent) || 0,
          gst_rate: parseFloat(item.gst_rate),
        })),
      };

      await axios.post(`${API}/credit-notes`, creditNoteData);
      toast.success('Credit note created successfully');
      navigate('/credit-notes');
    } catch (error) {
      console.error('Error creating credit note:', error);
      toast.error('Failed to create credit note');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Credit Note</h1>
        <p className="text-gray-500 mt-1">Create a credit note for returns or adjustments</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Credit Note Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={selectedCustomer?.id || ''}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value);
                  setSelectedCustomer(customer);
                }}
              >
                <SelectTrigger data-testid="customer-select">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invoice">Original Invoice *</Label>
              <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                <SelectTrigger data-testid="invoice-select">
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.invoice_number}>
                      {invoice.invoice_number} - {invoice.customer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="reason">Reason for Credit Note *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Product return, Damaged goods, Pricing adjustment"
                rows={2}
                required
                data-testid="reason-textarea"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Return Items</h2>
            <Button type="button" onClick={addItem} size="sm" data-testid="add-item-btn">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No items added. Click "Add Item" to begin.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-3">
                      <Label>Product *</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.discount_percent}
                        onChange={(e) => updateItem(index, 'discount_percent', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>GST %</Label>
                      <Input type="number" value={item.gst_rate} readOnly className="bg-gray-50" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-red-600">-₹{totals.totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxable Amount:</span>
              <span className="font-medium">₹{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST:</span>
              <span className="font-medium">₹{totals.totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Credit Amount:</span>
              <span className="text-red-600">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/credit-notes')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700" data-testid="create-credit-note-btn">
            <Save className="h-4 w-4 mr-2" />
            Create Credit Note
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCreditNote;