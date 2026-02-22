import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [paymentTerms, setPaymentTerms] = useState('immediate');
  const [vehicleNo, setVehicleNo] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
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

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = subtotal * (item.discount_percent / 100);
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * (item.gst_rate / 100);
    return taxableAmount + gstAmount;
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
      cgst: totalGst / 2,
      sgst: totalGst / 2,
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

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (items.some((item) => !item.product_id)) {
      toast.error('Please select products for all items');
      return;
    }

    try {
      const invoiceData = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_address: selectedCustomer.address || '',
        customer_phone: selectedCustomer.phone || '',
        customer_gst: selectedCustomer.gst_number || '',
        items: items,
        payment_status: paymentStatus,
        payment_terms: paymentTerms,
        vehicle_no: vehicleNo,
      };

      const response = await axios.post(`${API}/invoices`, invoiceData);
      toast.success('Invoice created successfully');
      navigate(`/invoices/${response.data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-500 mt-1">Generate a new sales invoice</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Select Customer *</Label>
              <Select
                value={selectedCustomer?.id || ''}
                onValueChange={(value) => {
                  const customer = customers.find((c) => c.id === value);
                  setSelectedCustomer(customer);
                }}
              >
                <SelectTrigger data-testid="customer-select">
                  <SelectValue placeholder="Choose a customer" />
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
            {selectedCustomer && (
              <>
                <div>
                  <Label>Address</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCustomer.address || '-'}
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCustomer.phone || '-'}
                  </p>
                </div>
                <div>
                  <Label>GST Number</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCustomer.gst_number || '-'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger data-testid="payment-terms-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="net_15">Net 15 Days</SelectItem>
                      <SelectItem value="net_30">Net 30 Days</SelectItem>
                      <SelectItem value="net_45">Net 45 Days</SelectItem>
                      <SelectItem value="net_60">Net 60 Days</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle_no">Vehicle Number</Label>
                  <Input
                    id="vehicle_no"
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="Enter vehicle number (optional)"
                    data-testid="vehicle-no-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              size="sm"
              data-testid="add-item-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items added. Click "Add Item" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Product
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Price
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Discount %
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      GST %
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Total
                    </th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateItem(index, 'product_id', value)}
                        >
                          <SelectTrigger className="w-48" data-testid={`item-product-${index}`}>
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
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-20"
                          data-testid={`item-quantity-${index}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                          data-testid={`item-price-${index}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.discount_percent}
                          onChange={(e) =>
                            updateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)
                          }
                          className="w-20"
                          data-testid={`item-discount-${index}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-600">{item.gst_rate}%</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{calculateItemTotal(item).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                          data-testid={`remove-item-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-₹{totals.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxable Amount:</span>
                <span className="font-medium">₹{totals.taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium">₹{totals.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium">₹{totals.sgst.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Grand Total:</span>
                  <span className="font-bold text-lg text-indigo-600" data-testid="grand-total">
                    ₹{totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-md ml-auto">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger data-testid="payment-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            data-testid="create-invoice-btn"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
