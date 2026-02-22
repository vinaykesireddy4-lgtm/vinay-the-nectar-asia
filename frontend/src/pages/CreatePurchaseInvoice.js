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

const CreatePurchaseInvoice = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSuppliers();
    fetchMaterials();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to fetch suppliers');
    }
  };

  const fetchMaterials = async () => {
    try {
      const [rawRes, packRes] = await Promise.all([
        axios.get(`${API}/raw-materials`),
        axios.get(`${API}/packing-materials`)
      ]);
      setRawMaterials(rawRes.data);
      setPackingMaterials(packRes.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch materials');
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        material_type: 'raw',
        material_id: '',
        material_name: '',
        quantity: 1,
        unit: 'kg',
        price: 0,
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

    if (field === 'material_id' && value) {
      const materials = newItems[index].material_type === 'raw' ? rawMaterials : packingMaterials;
      const material = materials.find((m) => m.id === value);
      if (material) {
        newItems[index].material_name = material.name;
        newItems[index].price = material.purchase_price || 0;
        newItems[index].unit = material.unit;
        newItems[index].gst_rate = material.gst_rate;
      }
    }

    if (field === 'material_type') {
      newItems[index].material_id = '';
      newItems[index].material_name = '';
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.price;
      const itemGst = itemSubtotal * (item.gst_rate / 100);

      subtotal += itemSubtotal;
      totalGst += itemGst;
    });

    const grandTotal = subtotal + totalGst;

    return {
      subtotal,
      totalGst,
      grandTotal,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (items.some((item) => !item.material_id)) {
      toast.error('Please select materials for all items');
      return;
    }

    try {
      const invoiceData = {
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.name,
        supplier_address: selectedSupplier.address || '',
        supplier_phone: selectedSupplier.phone || '',
        supplier_gst: selectedSupplier.gstin || '',
        supplier_invoice_no: '',
        items: items.map((item) => ({
          item_type: item.material_type === 'raw' ? 'raw_material' : 'packing_material',
          item_id: item.material_id,
          item_name: item.material_name,
          hsn_code: '',
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          price: parseFloat(item.price),
          discount_percent: 0,
          gst_rate: parseFloat(item.gst_rate),
        })),
      };

      await axios.post(`${API}/purchase-invoices`, invoiceData);
      toast.success('Purchase invoice created successfully');
      navigate('/purchase-invoices');
    } catch (error) {
      console.error('Error creating purchase invoice:', error);
      toast.error('Failed to create purchase invoice');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Purchase Invoice</h1>
        <p className="text-gray-500 mt-1">Record a purchase invoice from supplier</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                value={selectedSupplier?.id || ''}
                onValueChange={(value) => {
                  const supplier = suppliers.find((s) => s.id === value);
                  setSelectedSupplier(supplier);
                }}
              >
                <SelectTrigger data-testid="supplier-select">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                data-testid="due-date-input"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
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
                    <div className="col-span-2">
                      <Label>Type *</Label>
                      <Select
                        value={item.material_type}
                        onValueChange={(value) => updateItem(index, 'material_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="raw">Raw Material</SelectItem>
                          <SelectItem value="packing">Packing Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label>Material *</Label>
                      <Select
                        value={item.material_id}
                        onValueChange={(value) => updateItem(index, 'material_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {(item.material_type === 'raw' ? rawMaterials : packingMaterials).map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.name}
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
              <span className="text-gray-600">GST:</span>
              <span className="font-medium">₹{totals.totalGst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span className="text-indigo-600">₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes"
            data-testid="notes-input"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase-invoices')}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" data-testid="create-purchase-invoice-btn">
            <Save className="h-4 w-4 mr-2" />
            Create Purchase Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseInvoice;